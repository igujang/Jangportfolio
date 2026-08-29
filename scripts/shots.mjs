import puppeteer from 'puppeteer-core'
import { mkdir } from 'node:fs/promises'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = process.env.BASE || 'http://localhost:3000'
const OUT = process.argv[2] || './shots'

const VIEWS = [
  { name: 'desktop', width: 1920, height: 1080, dsf: 1 },
  { name: 'tablet', width: 834, height: 1112, dsf: 1 },
  { name: 'mobile', width: 390, height: 844, dsf: 2 },
]

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required'],
})

await mkdir(OUT, { recursive: true })

for (const v of VIEWS) {
  const page = await browser.newPage()
  await page.setViewport({
    width: v.width,
    height: v.height,
    deviceScaleFactor: v.dsf,
    hasTouch: v.name !== 'desktop',
    isMobile: v.name === 'mobile',
  })

  // 1) 인덱스
  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 })
  await page.evaluate(() => document.fonts.ready)
  await wait(1500)
  await page.screenshot({ path: `${OUT}/${v.name}-index.png` })

  // 2) 인덱스에서 프로젝트 클릭 → 모달
  const links = await page.$$('ul li a')
  const target = links[3] // 03 Place_NE (썸네일 영상 있음)
  if (target) {
    if (v.name === 'desktop') await target.hover()
    await target.click()
    await wait(2200)
    await page.screenshot({ path: `${OUT}/${v.name}-modal.png` })
    await page.evaluate(() => window.scrollTo(0, 900))
    await wait(1200)
    await page.screenshot({ path: `${OUT}/${v.name}-modal-scroll.png` })
  }
  console.log(`  ${v.name} 완료`)
  await page.close()
}

await browser.close()
console.log('\n스크린샷 →', OUT)
