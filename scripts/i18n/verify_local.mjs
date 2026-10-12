// Functional audit: 21 modules × 3 languages, state preservation and mobile overflow.
import fs from 'node:fs'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '../../frontend/node_modules/playwright')
const base = process.env.SITE_URL || 'http://127.0.0.1:4177/mgenetica/'
const curriculum = JSON.parse(fs.readFileSync('frontend/src/data/legacy-curriculum.generated.json','utf8'))
const browser = await chromium.launch({ headless:true })
const page = await browser.newPage({viewport:{width:1280,height:900}})
const errors=[],requests=[],results=[]
page.on('pageerror', e => errors.push(e.message))
page.on('request', r => { if (/appwrite|\/functions\//.test(r.url())) requests.push(r.url()) })
async function controls(frame) {
  return frame.locator('input,select').evaluateAll(nodes => nodes.map(n => ({id:n.id,value:n.value,checked:n.checked})))
}
async function numericResults(frame) {
  return frame.locator('.val').evaluateAll(nodes => nodes.map(n=>n.textContent.match(/-?\d+(?:[.,]\d+)?/g)))
}
try {
 for (const module of curriculum.modules) {
  await page.goto(`${base}#course/${module.id}`)
  await page.waitForFunction(file=>document.querySelector('.course-lab-card iframe')?.getAttribute('src')?.includes(file),module.labFile)
  await page.locator('.course-lab-card iframe').scrollIntoViewIfNeeded()
  const handle=await page.locator('.course-lab-card iframe').elementHandle()
  const frame=await handle.contentFrame()
  await frame.waitForFunction(()=>!!window.MGi18n)
  for (const locale of ['pt-BR','en','es']) {
   if (locale==='pt-BR') await page.locator('select[name="locale"]').selectOption(locale)
   const before=await controls(frame)
   const beforeNumbers=await numericResults(frame)
   const identity=await frame.evaluate(()=>{window.__identity ||= Math.random();return window.__identity})
   await page.locator('select[name="locale"]').selectOption(locale)
   await frame.waitForFunction(lang=>window.MGi18n.lang()===lang && document.documentElement.lang===lang,locale)
   const after=await controls(frame)
   assert.deepEqual(after,before,`${module.id}/${locale}: controls reset`)
   assert.deepEqual(await numericResults(frame),beforeNumbers,`${module.id}/${locale}: calculation changed`)
   assert.equal(await frame.evaluate(()=>window.__identity),identity,'iframe reloaded')
   assert.equal(await page.locator('.course-lab-card').count(),1)
   const body=await frame.locator('body').innerText()
   const heading=await frame.locator('h1').innerText()
   if(locale!=='pt-BR')assert.doesNotMatch(body,/Experimente:|Laboratório interativo|Faça o cruzamento-teste|proporção genotípica|Escolha o genótipo/,`${module.id}: Portuguese lab prose`)
   await page.setViewportSize({width:390,height:844})
   const widths=await page.evaluate(()=>({view:innerWidth,body:document.documentElement.scrollWidth}))
   assert.ok(widths.body<=widths.view+1,`${module.id}/${locale}: page mobile overflow`)
   const labWidths=await frame.evaluate(()=>({view:innerWidth,body:document.documentElement.scrollWidth}))
   assert.ok(labWidths.body<=labWidths.view+1,`${module.id}/${locale}: lab mobile overflow ${JSON.stringify(labWidths)}`)
   await page.setViewportSize({width:1280,height:900})
   results.push({module:module.id,locale,heading,controls:after.length})
  }
  const input=frame.locator('input[type="range"]:not([disabled])').first()
  if(await input.count()) {
   await input.focus();const value=await input.inputValue();await input.press('ArrowRight');
   const next=await input.inputValue();
   if(value===next)await input.press('ArrowLeft')
   assert.notEqual(await input.inputValue(),value,`${module.id}: slider unresponsive`)
  }
  if(module.id==='module-01') {
   await frame.locator('#segMae button[data-g="aa"]').click()
   assert.match(await frame.locator('#ratioTxt').innerText(),/0\s*:\s*2\s*:\s*2/)
   await page.locator('select[name="locale"]').selectOption('en')
   assert.match(await frame.locator('#ratioTxt').innerText(),/0\s*:\s*2\s*:\s*2/)
  }
  if(module.id==='module-05') {
   await frame.locator('#drift').check()
   const trajectory=await frame.evaluate(()=>lastDrift.slice())
   await page.locator('select[name="locale"]').selectOption('en')
   assert.deepEqual(await frame.evaluate(()=>lastDrift.slice()),trajectory,'language regenerated random drift')
  }
  if(module.id==='module-18') {
   const cell=frame.locator('#matrix button').first(),before=await cell.innerText();await cell.click()
   assert.notEqual(await cell.innerText(),before,'SNP cell unresponsive')
  }
  console.log(JSON.stringify({module:module.id,verified:true}))
 }
 assert.deepEqual(errors,[],'browser errors')
 assert.deepEqual(requests,[],'public course called backend')
} finally {
 fs.writeFileSync('/tmp/mgenetica-i18n-browser-report.json',JSON.stringify({cases:results.length,results,errors,backendRequests:requests},null,2)+'\n')
 await browser.close()
}
