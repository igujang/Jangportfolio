/**
 * Font/ 폴더의 Pretendard 원본(otf)을 웹용 woff2로 변환한다.
 * 사이트에서 쓰는 굵기만 뽑고, 한글·영문 영역만 남겨 용량을 줄인다. (14MB → 2.3MB)
 * 필요: python + fonttools + brotli   (pip install fonttools brotli)
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdir, stat } from 'node:fs/promises'
import path from 'node:path'

const run = promisify(execFile)
const WEIGHTS = ['Regular', 'Medium', 'SemiBold', 'Bold']
const UNICODES = [
  'U+0000-00FF', 'U+0131', 'U+0152-0153', 'U+02BB-02BC', 'U+02C6', 'U+02DA', 'U+02DC',
  'U+2000-206F', 'U+2070-209F', 'U+20A0-20BF', 'U+2100-214F', 'U+2190-21BB', 'U+2200-22FF',
  'U+25A0-25FF', 'U+2600-26FF', 'U+3000-303F', 'U+3130-318F', 'U+AC00-D7A3', 'U+FF00-FFEF',
].join(',')

const kb = (n) => (n / 1024).toFixed(0)

await mkdir('public/fonts', { recursive: true })
for (const w of WEIGHTS) {
  const src = path.join('Font', `Pretendard-${w}.otf`)
  const dst = path.join('public', 'fonts', `Pretendard-${w}.woff2`)
  await run('python', ['-m', 'fontTools.subset', src,
    `--output-file=${dst}`, '--flavor=woff2', '--layout-features=*',
    `--unicodes=${UNICODES}`, '--no-hinting', '--desubroutinize'])
  const [a, b] = await Promise.all([stat(src), stat(dst)])
  console.log(`  ${w.padEnd(10)} ${kb(a.size)}KB → ${kb(b.size)}KB`)
}
