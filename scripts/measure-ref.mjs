import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
})
const p = await b.newPage()
await p.setViewport({ width: 1920, height: 1080 })
await p.goto('https://skiper-ui.com/v1/skiper24', { waitUntil: 'networkidle2', timeout: 90000 })
await new Promise(r => setTimeout(r, 4000))

const data = await p.evaluate(() => {
  // 화면에서 가장 큰 글자들을 프로젝트 제목으로 본다
  const all = [...document.querySelectorAll('body *')].filter(e => {
    const t = (e.textContent || '').trim()
    return t && e.children.length === 0 && t.length < 60
  })
  const sized = all.map(e => {
    const cs = getComputedStyle(e)
    const r = e.getBoundingClientRect()
    return { text: (e.textContent||'').trim(), fs: parseFloat(cs.fontSize), fw: cs.fontWeight,
             ls: cs.letterSpacing, lh: cs.lineHeight, color: cs.color,
             top: Math.round(r.top), left: Math.round(r.left), h: Math.round(r.height), w: Math.round(r.width),
             bg: cs.backgroundColor, pad: cs.padding, radius: cs.borderRadius }
  }).filter(x => x.fs > 0 && x.h > 0)

  const big = sized.filter(x => x.fs >= 30).sort((a,b) => a.top - b.top)
  const small = sized.filter(x => x.fs < 30 && x.fs > 8).sort((a,b) => a.top - b.top)

  // 썸네일 후보 (정사각형에 가까운 큰 박스)
  const boxes = [...document.querySelectorAll('img, div')].map(e => {
    const r = e.getBoundingClientRect()
    const cs = getComputedStyle(e)
    return { w: Math.round(r.width), h: Math.round(r.height), left: Math.round(r.left), top: Math.round(r.top), radius: cs.borderRadius, tag: e.tagName }
  }).filter(x => x.w > 200 && x.h > 200 && Math.abs(x.w - x.h) < 60 && x.left > 900)

  return { big: big.slice(0, 8), small: small.slice(0, 8), boxes: boxes.slice(0, 4),
           bodyFont: getComputedStyle(document.body).fontFamily }
})

console.log('=== 제목 (큰 글자) ===')
for (const t of data.big) console.log(`  "${t.text}"  ${t.fs}px  w${t.fw}  자간${t.ls}  행간${t.lh}  top=${t.top} h=${t.h}  ${t.color}`)
console.log('\n=== 카테고리 / 날짜 (작은 글자) ===')
for (const t of data.small) console.log(`  "${t.text}"  ${t.fs}px  w${t.fw}  자간${t.ls}  top=${t.top} h=${t.h}  bg=${t.bg} pad=${t.pad} r=${t.radius}  ${t.color}`)
console.log('\n=== 썸네일 박스 ===')
for (const x of data.boxes) console.log(`  ${x.tag} ${x.w}x${x.h}  left=${x.left} top=${x.top}  radius=${x.radius}`)
console.log('\n폰트:', data.bodyFont)

await p.screenshot({ path: process.argv[2] + '/skiper24.png' })
await b.close()
