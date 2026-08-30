import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OUT = join(ROOT, 'docs', 'screenshots')
mkdirSync(OUT, { recursive: true })
const BASE = process.env.SHOT_URL ?? 'http://localhost:4173/'

const browser = await chromium.launch()

async function shoot(name, { width, height, dsf, scrollVh, isMobile }) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: dsf,
    isMobile: Boolean(isMobile),
    hasTouch: Boolean(isMobile),
  })
  const page = await ctx.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(3200)
  if (scrollVh) {
    await page.evaluate((vh) => {
      const y = vh * window.innerHeight
      const lenis = window.__lenis
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true })
      else window.scrollTo(0, y)
    }, scrollVh)
    await page.waitForTimeout(2000)
  }
  await page.screenshot({ path: join(OUT, name) })
  await ctx.close()
  console.log('✓', name)
}

const D = { width: 1600, height: 900, dsf: 1 }
const P = { width: 390, height: 844, dsf: 2, isMobile: true }

await shoot('shot-01-hero-desktop.png', { ...D, scrollVh: 0 })
await shoot('shot-02-record-desktop.png', { ...D, scrollVh: 1.3 })
await shoot('shot-03-vault-desktop.png', { ...D, scrollVh: 2.6 })
await shoot('shot-04-podcast-desktop.png', { ...D, scrollVh: 4.1 })
await shoot('shot-05-fitcheck-desktop.png', { ...D, scrollVh: 5.3 })
await shoot('shot-06-end-desktop.png', { ...D, scrollVh: 7.5 })
await shoot('shot-07-hero-phone.png', { ...P, scrollVh: 0 })
await shoot('shot-08-vault-phone.png', { ...P, scrollVh: 2.6 })

await browser.close()
console.log('done → docs/screenshots/')
