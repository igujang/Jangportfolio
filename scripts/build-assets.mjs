/**
 * 원본 자료(Project/)를 웹용으로 변환해 public/works/ 와 content/works.json 을 만든다.
 *  - 이미지  : 5MB 미만이면 손대지 않고 그대로 복사. 그 이상만 줄여 굽는다.
 *  - GIF     : mp4 루프 영상으로 변환 (화질↑ 용량↓)
 *  - .txt    : 비메오 iframe에서 영상 ID·비율·루프여부 추출
 * 원본은 절대 수정하지 않는다.
 *
 * PROJECTS 옵션
 *  - gap        : 상세 페이지에서 이미지 사이 세로 간격(px)
 *  - award      : 수상·선정 표기
 *  - blank      : 목록에만 남기고 내용은 비움
 *  - grid       : 세로로 쌓지 않고 인스타그램 피드처럼 격자로 깐다
 *  - skipFirst  : 첫 장(표지)을 본문에서 뺀다. 원본은 그대로 두고 여기서만
 *                 걸러내므로, 되돌리려면 이 줄만 지우면 된다.
 */
import { readdir, mkdir, rm, writeFile, readFile, stat, rename, copyFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import sharp from 'sharp'

const run = promisify(execFile)
const ROOT = process.cwd()
const SRC = path.join(ROOT, 'Project')
const OUT = path.join(ROOT, 'public', 'works')

/**
 * 이미지는 원칙적으로 손대지 않는다.
 *
 * 예전에는 전부 긴 변 2800px + JPEG q90 으로 다시 구웠는데, 여기에 next/image
 * 의 AVIF q75 재인코딩까지 겹쳐 화질이 눈에 띄게 무너졌다.
 * 실측(주요기업_1.jpg): 원본 902KB → 변환 319KB → 브라우저 39KB. 원본의 4%.
 *
 * 그래서 5MB 미만은 원본을 그대로 복사하고, 그보다 큰 것만 줄여 굽는다.
 * 현재 자료 중 5MB 를 넘는 건 대학교_기업_4.jpg(5.2MB) 한 장뿐이다.
 */
const KEEP_UNDER = 5 * 1048576 // 이보다 작으면 원본 그대로

/** 줄여야 할 때는 '긴 변'이 아니라 '가로'를 기준으로 한다.
 *  레이아웃이 가로 폭으로 정해지므로, 세로로 긴 이미지의 긴 변을 자르면
 *  정작 중요한 가로 해상도가 깎인다 (대학교_기업_1: 1920 → 1159, -40%). */
const MAX_WIDTH = 2400
const JPEG_Q = 95

/** 썸네일은 작업물이 아니라 목록용 축소본이다. 화면에서 400px 남짓으로만
 *  보이므로 고해상도 화면 기준 800px 이면 충분하다. */
const THUMB_EDGE = 800
const THUMB_Q = 92

/** "순서와 카테고리 분류.txt" 기준 */
const PROJECTS = [
  { n: '01', dir: '01 참이슬 오리지날 I BX Renewal (개인프로젝트)', slug: 'chamisul', title: '참이슬 오리지날 I BX Renewal (개인프로젝트)', category: 'SOJU', gap: 0 },
  { n: '02', dir: '02 locl l BX Renewal', slug: 'locl', title: 'locl I BX Renewal', category: 'APP', gap: 0 },
  { n: '03', dir: '03 Place_NE l BX Design', slug: 'place-ne', title: 'Place_NE I BX Design', category: 'CAFE', gap: 60, award: '노트폴리오 PICK 선정' },
  { n: '04', dir: '04 1853 I BX Design', slug: '1853', title: '1853 I BX Design', category: 'BIKE SHOP', gap: 60 },
  { n: '05', dir: '05 Dorrr l BX Design', slug: 'dorrr', title: 'Dorrr I BX Design', category: 'GOLFWEAR', gap: 60 },
  { n: '06', dir: '06 지중서원 l BX Design', slug: 'jijung', title: '지중서원 I BX Design', category: 'HOTEL', gap: 60 },
  { n: '07', dir: '07 솔솔바람다님길 l BX Design', slug: 'solsol', title: '솔솔바람다님길 I BX Design', category: 'TRAIL', gap: 60 },
  { n: '08', dir: '08 쌤슐랭 I BX Design', slug: 'ssamsulin', title: '쌤슐랭 I BX Design', category: 'EDUCATION', gap: 60 },
  { n: '09', dir: '09 판판서양주점 I BX Design', slug: 'panpan', title: '판판서양주점 I BX Design', category: 'PUB', gap: 60 },
  { n: '10', dir: '10 청해주조 I BX Design', slug: 'cheonghae', title: '청해주조 I BX Design', category: 'BREWERY', gap: 60 },
  { n: '11', dir: '11 웹개발자로드맵 I Book Cover Design', slug: 'web-roadmap', title: '웹개발자로드맵 I Book Cover Design', category: 'BOOK', gap: 60 },
  { n: '12', dir: '12 대학교, 기업 교육 및 행사 디자인', slug: 'event-design', title: '대학교, 기업 교육 및 행사 디자인', category: 'EVENT', gap: 0 },
  { n: '13', dir: '13. 주요 기업 · 공공기관 협업', slug: 'clients', title: '주요 기업 · 공공기관 협업', category: 'CLIENTS', gap: 0 },
  { n: '14', dir: '14 로고 디자인 작업 아카이브', slug: 'logo-archive', title: '로고디자인 아카이브', category: 'LOGO', gap: 0, grid: true },
]

const isImage = (f) => /\.(jpe?g|png|webp)$/i.test(f)
/** GIF와 동영상은 모두 mp4 루프로 통일한다 */
const isGif = (f) => /\.(gif|mp4|mov|webm|m4v)$/i.test(f)
const isTxt = (f) => /\.txt$/i.test(f)
const isThumb = (f) => /thum/i.test(f) && (isImage(f) || isGif(f))

/**
 * 파일명 안의 숫자들을 순서대로 뽑아 비교한다.
 *   1.jpg → [1]   ·   4-1.jpg → [4,1]   ·   10.jpg → [10]
 * 덕분에 4 → 4-1 → 4-2 → 5 순서가 유지된다.
 */
function orderKey(f) {
  const nums = path.basename(f, path.extname(f)).match(/\d+/g)
  return nums ? nums.map(Number) : [Number.MAX_SAFE_INTEGER]
}

function compareByNumber(a, b) {
  const ka = orderKey(a)
  const kb = orderKey(b)
  for (let i = 0; i < Math.max(ka.length, kb.length); i++) {
    const d = (ka[i] ?? -1) - (kb[i] ?? -1)
    if (d) return d
  }
  return a.localeCompare(b, 'ko')
}

/** 비메오 iframe 파싱 */
async function parseVimeo(file) {
  const html = await readFile(file, 'utf8')
  const id = html.match(/player\.vimeo\.com\/video\/(\d+)/)?.[1]
  if (!id) return null
  return {
    type: 'vimeo',
    id,
    loop: /background=1/.test(html), // 컨트롤 없이 무한 반복
    w: Number(html.match(/width="(\d+)"/)?.[1] || 1920),
    h: Number(html.match(/height="(\d+)"/)?.[1] || 1080),
  }
}

/**
 * 본문 이미지. 5MB 미만이면 원본을 그대로 복사한다 — 확장자도 그대로 둔다.
 * 5MB 이상만 가로 2400px 로 줄이고 JPEG q95 로 굽는다.
 * 돌려주는 dest 는 실제로 만들어진 파일 경로다(확장자가 달라질 수 있다).
 */
async function putImage(src, outDir, base) {
  const size = (await stat(src)).size
  if (size < KEEP_UNDER) {
    const dest = path.join(outDir, `${base}${path.extname(src).toLowerCase()}`)
    await copyFile(src, dest)
    const m = await sharp(dest, { limitInputPixels: false }).metadata()
    return { dest, w: m.width, h: m.height }
  }
  const dest = path.join(outDir, `${base}.jpg`)
  const img = sharp(src, { limitInputPixels: false })
  const meta = await img.metadata()
  const pipeline =
    meta.width > MAX_WIDTH
      ? img.resize({ width: MAX_WIDTH, kernel: 'lanczos3', withoutEnlargement: true })
      : img
  // 투명한 원본(PNG)을 JPEG 으로 구울 때는 흰색으로 깔아야 한다.
  // sharp 의 기본 합성 색이 검정이라, 그대로 두면 투명 영역이 까맣게 변한다.
  await pipeline
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: JPEG_Q, chromaSubsampling: '4:4:4', mozjpeg: true })
    .toFile(dest)
  const out = await sharp(dest).metadata()
  return { dest, w: out.width, h: out.height }
}

/** 목록용 썸네일 — 화면에서 400px 남짓이라 800px 로 줄여 둔다. */
async function makeThumb(src, dest) {
  const img = sharp(src, { limitInputPixels: false })
  const meta = await img.metadata()
  const long = Math.max(meta.width, meta.height)
  const pipeline =
    long > THUMB_EDGE
      ? img.resize({
          width: meta.width >= meta.height ? THUMB_EDGE : null,
          height: meta.height > meta.width ? THUMB_EDGE : null,
          kernel: 'lanczos3',
          withoutEnlargement: true,
        })
      : img
  await pipeline
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: THUMB_Q, chromaSubsampling: '4:4:4', mozjpeg: true })
    .toFile(dest)
  const out = await sharp(dest).metadata()
  return { w: out.width, h: out.height }
}

/** GIF·동영상 → mp4 루프 영상 (화질↑ 용량↓) */
async function convertGif(src, dest) {
  await run(
    'ffmpeg',
    ['-y', '-i', src, '-movflags', '+faststart', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2:flags=lanczos', '-crf', '20', '-an', dest],
    { maxBuffer: 1 << 26 }
  )
  const { stdout } = await run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', dest])
  const [w, h] = stdout.trim().split(',').map(Number)
  return { w, h }
}

/** 지정한 후보 경로 중 실제로 존재하는 첫 파일을 찾는다 */
async function firstExisting(paths) {
  for (const p of paths) {
    try {
      await stat(p)
      return p
    } catch {
      // 다음 후보로
    }
  }
  return null
}

/**
 * 프로필 사진 → 정사각형 2종.
 *  - profile.jpg (800px) : 이름 행 호버 시 나오는 썸네일  ← Thum_Profile.jpg
 *  - avatar.jpg  (160px) : 모달 상단의 동그란 프로필      ← Circle_Thum.jpg
 * 새 파일이 없으면 예전 프로필사진.png로 대체한다.
 */
async function buildProfile() {
  const base = path.join(ROOT, 'Jand dong ho profile')
  const fallback = path.join(base, '프로필사진.png')

  const thumbSrc = await firstExisting([path.join(base, 'Thum_Profile.jpg'), fallback])
  const avatarSrc = await firstExisting([
    path.join(base, 'Circle_Thum.jpg'),
    path.join(base, 'Thum_Profile.jpg'),
    fallback,
  ])

  if (!thumbSrc && !avatarSrc) {
    console.log('  프로필 사진 없음 — 건너뜀')
    return null
  }

  const dir = path.join(ROOT, 'public')
  // 지난 빌드가 남긴 해시 이름 파일을 지운다 (public/ 은 통째로 비우지 않는다)
  for (const f of await readdir(dir)) {
    if (/^(profile|avatar)\.[0-9a-f]{8}\.jpg$/.test(f)) await rm(path.join(dir, f))
  }
  if (thumbSrc) {
    await sharp(thumbSrc, { limitInputPixels: false })
      .resize(800, 800, { fit: 'cover', position: 'attention', kernel: 'lanczos3' })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: THUMB_Q, chromaSubsampling: '4:4:4', mozjpeg: true })
      .toFile(path.join(dir, 'profile.jpg'))
  }
  if (avatarSrc) {
    await sharp(avatarSrc, { limitInputPixels: false })
      .resize(160, 160, { fit: 'cover', position: 'attention', kernel: 'lanczos3' })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 92, chromaSubsampling: '4:4:4', mozjpeg: true })
      .toFile(path.join(dir, 'avatar.jpg'))
  }
  const out = {
    profile: thumbSrc ? await fingerprint(path.join(dir, 'profile.jpg'), '') : '/profile.jpg',
    avatar: avatarSrc ? await fingerprint(path.join(dir, 'avatar.jpg'), '') : '/avatar.jpg',
  }
  await mkdir(path.join(ROOT, 'content'), { recursive: true })
  await writeFile(path.join(ROOT, 'content', 'profile.json'), JSON.stringify(out, null, 2))
  console.log(`  프로필 사진 → ${out.profile} (${path.basename(thumbSrc ?? '')}) · ${out.avatar} (${path.basename(avatarSrc ?? '')})`)
  return true
}

const mb = (n) => (n / 1048576).toFixed(1)

/**
 * 파일 이름에 내용 해시를 박고 그 주소를 돌려준다.
 *   thumb.jpg → thumb.ab295a1a.jpg
 *
 * 이름이 그대로면 내용을 바꿔도 브라우저가 예전 것을 계속 쓴다. 실제로
 * 썸네일과 프로필을 갈아 끼웠는데 화면이 그대로라 몇 번 헤맸다. 내용이
 * 바뀌면 이름이 바뀌므로 강제 새로고침 없이도 항상 최신이 뜬다.
 *
 * ?v=해시 쿼리로도 되지만 next/image 가 images.localPatterns 설정을 요구하고,
 * search 를 생략하면 아무 쿼리나 최적화를 태울 수 있어 문서가 경고한다.
 * 이름에 박으면 설정이 아예 필요 없다.
 */
async function fingerprint(destPath, publicDir) {
  const h = createHash('md5').update(await readFile(destPath)).digest('hex').slice(0, 8)
  const ext = path.extname(destPath)
  const named = `${path.basename(destPath, ext)}.${h}${ext}`
  await rename(destPath, path.join(path.dirname(destPath), named))
  return `${publicDir}/${named}`
}

async function main() {
  await rm(OUT, { recursive: true, force: true })
  await mkdir(OUT, { recursive: true })

  const manifest = []
  let srcTotal = 0
  let outTotal = 0

  for (const p of PROJECTS) {
    const srcDir = path.join(SRC, p.dir)
    const outDir = path.join(OUT, p.slug)
    await mkdir(outDir, { recursive: true })

    const files = await readdir(srcDir)
    const thumbFile = files.find(isThumb) ?? null
    const bodyFiles = files.filter((f) => f !== thumbFile && (isImage(f) || isGif(f) || isTxt(f)))

    // 12번 폴더는 파일명에 순번이 없으므로 이름순, 나머지는 숫자순
    bodyFiles.sort(compareByNumber)

    // 표지 한 장 제외 — 목록 썸네일과 겹쳐서 상세를 열면 같은 그림이
    // 한 번 더 나온다. 원본은 두고 여기서만 걸러낸다.
    if (p.skipFirst && bodyFiles.length) {
      const [dropped] = bodyFiles.splice(0, 1)
      console.log(`  ${p.n} ${p.slug} — 표지 제외: ${dropped}`)
    }

    // ── 썸네일 ──
    let thumb = null
    if (thumbFile) {
      const s = path.join(srcDir, thumbFile)
      srcTotal += (await stat(s)).size
      if (isGif(thumbFile)) {
        const d = path.join(outDir, 'thumb.mp4')
        const { w, h } = await convertGif(s, d)
        outTotal += (await stat(d)).size
        thumb = { type: 'video', src: await fingerprint(d, `/works/${p.slug}`), w, h }
      } else {
        const d = path.join(outDir, 'thumb.jpg')
        const { w, h } = await makeThumb(s, d)
        outTotal += (await stat(d)).size
        thumb = { type: 'image', src: await fingerprint(d, `/works/${p.slug}`), w, h }
      }
    }

    // ── 본문 ── (blank 프로젝트는 목록에만 남기고 내용은 비운다)
    const blocks = []
    let i = 0
    for (const f of p.blank ? [] : bodyFiles) {
      const s = path.join(srcDir, f)
      if (isTxt(f)) {
        const v = await parseVimeo(s)
        if (v) blocks.push(v)
        continue
      }
      srcTotal += (await stat(s)).size
      const idx = String(++i).padStart(2, '0')
      if (isGif(f)) {
        const d = path.join(outDir, `${idx}.mp4`)
        const { w, h } = await convertGif(s, d)
        outTotal += (await stat(d)).size
        blocks.push({ type: 'video', src: await fingerprint(d, `/works/${p.slug}`), w, h })
      } else {
        const { dest, w, h } = await putImage(s, outDir, idx)
        outTotal += (await stat(dest)).size
        blocks.push({ type: 'image', src: await fingerprint(dest, `/works/${p.slug}`), w, h })
      }
    }

    manifest.push({ ...p, thumb, blocks })
    const v = blocks.filter((b) => b.type === 'vimeo').length
    console.log(`  ${p.n} ${p.slug.padEnd(13)} 블록 ${String(blocks.length).padStart(2)}개 (비메오 ${v}) ${thumb ? '썸네일 ' + thumb.type : '썸네일 없음'}`)
  }

  await buildProfile()

  await mkdir(path.join(ROOT, 'content'), { recursive: true })
  await writeFile(path.join(ROOT, 'content', 'works.json'), JSON.stringify(manifest, null, 2))
  console.log(`\n  원본 ${mb(srcTotal)}MB  →  변환 ${mb(outTotal)}MB  (${Math.round((1 - outTotal / srcTotal) * 100)}% 감소)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
