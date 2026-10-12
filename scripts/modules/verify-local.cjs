const { chromium } = require(process.env.PLAYWRIGHT_PATH);
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch();
 const page = await browser.newPage();
 const errors = [];
 page.on('pageerror', e => errors.push(e.message));
 const base = process.env.SITE_URL || 'http://127.0.0.1:4180/mgenetica/';
 for (const width of [1440,768,390,320]) {
  await page.setViewportSize({width,height:900});
  await page.goto(base+'#course/module-01');
  await page.locator('.module-contents button').first().waitFor();
  assert.equal(await page.locator('h1').count(),1);
  await page.locator('.module-contents button').first().click();
  assert.equal(await page.evaluate(()=>document.activeElement.id),'module-section-0');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:`/tmp/module-${width}.png`,fullPage:false});
 }
 assert.deepEqual(errors,[]);
 await browser.close();
 console.log('PASS module heading, section focus, 4 widths, zero errors');
})().catch(e=>{console.error(e);process.exit(1)});
