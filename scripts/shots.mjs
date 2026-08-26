import puppeteer from 'puppeteer-core'
import { mkdir } from 'node:fs/promises'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = 'http://localhost:4322'
const OUT = process.argv[2] || './shots'

const VIEWS = [
  { name: 'desktop', width: 1920, height: 1080, dsf: 1 },
  { name: 'tablet', width: 834, height: 1112, dsf: 1 },
  { name: 'mobile', width: 390, height: 844, dsf: 2 },
]

const PAGES = [
  { name: 'main', path: '/' },
  { name: 'detail', path: '/works/chamisul' },
  { name: 'about', path: '/about' },
]

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required'],
})

await mkdir(OUT, { recursive: true })

for (const v of VIEWS) {
  for (const p of PAGES) {
    const page = await browser.newPage()
    await page.setViewport({
      width: v.width,
      height: v.height,
      deviceScaleFactor: v.dsf,
      hasTouch: v.name !== 'desktop',
      isMobile: v.name === 'mobile',
    })
    await page.goto(BASE + p.path, { waitUntil: 'networkidle2', timeout: 60000 })
    await wait(1800) // 폰트 + 썸네일 영상 첫 프레임 대기

    // 메인 데스크탑에서는 3번째 항목에 호버한 상태도 함께 담는다
    if (p.name === 'main' && v.name === 'desktop') {
      await page.screenshot({ path: `${OUT}/${v.name}-${p.name}.png` })
      const links = await page.$$('ul li a')
      if (links[2]) {
        await links[2].hover()
        await wait(900)
        await page.screenshot({ path: `${OUT}/${v.name}-main-hover.png` })
      }
    } else {
      await page.screenshot({ path: `${OUT}/${v.name}-${p.name}.png` })
    }
    console.log(`  ${v.name.padEnd(8)} ${p.path}`)
    await page.close()
  }
}

await browser.close()
console.log('\n스크린샷 완료 →', OUT)
