const {chromium}=require(process.env.PLAYWRIGHT_PATH||'../../frontend/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const base=process.env.SITE_URL||'http://127.0.0.1:4184/mgenetica/';
 const browser=await chromium.launch();const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [375,768,1024,1440]){
  await page.setViewportSize({width,height:900});await page.goto(base);await page.locator('.blog-card').first().waitFor();
  assert.equal(await page.locator('.blog-card').count(),2);assert.equal(await page.locator('a[href*="course"],a[href*="catalog"]').count(),0);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:`/tmp/blog-phase-${width}.png`,fullPage:true});
  await page.locator('.blog-card').filter({hasText:'temperatura'}).locator('.blog-read').click();assert.match(page.url(),/\/blog\/genetica-temperatura-desempenho-cavalos\//);await page.locator('.blog-prose').waitFor();
  assert((await page.locator('.blog-prose').innerText()).length>10000);assert.equal(await page.locator('h1').count(),1);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 await page.goto(base+'#course/module-01');await page.getByRole('heading',{name:'Esta página está em preparação'}).waitFor();
 await page.goto(base+'#blog/genetica-temperatura-desempenho-cavalos');await page.waitForURL('**/blog/genetica-temperatura-desempenho-cavalos/');
 const context=await browser.newContext({javaScriptEnabled:false});const staticPage=await context.newPage();
 await staticPage.goto(base+'blog/genetica-temperatura-desempenho-cavalos/');assert((await staticPage.locator('.blog-prose').innerText()).length>10000);
 assert.equal(await staticPage.locator('link[rel=canonical]').getAttribute('href'),'https://www.mgenetica.com/blog/genetica-temperatura-desempenho-cavalos/');
 const schema=JSON.parse(await staticPage.locator('script[type="application/ld+json"]').first().textContent());assert.equal(schema['@type'],'BlogPosting');
 assert((await (await page.request.get(base+'sitemap.xml')).text()).includes('/blog/genetica-temperatura-desempenho-cavalos/'));
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS blog-only navigation, preserved article, 4 widths, legacy URLs, HTML without JS, canonical, schema and sitemap');
})();
