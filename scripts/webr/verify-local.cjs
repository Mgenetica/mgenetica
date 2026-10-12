const { chromium } = require(process.env.PLAYWRIGHT_PATH);
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch(); const page=await browser.newPage();
 const base=process.env.SITE_URL || 'http://127.0.0.1:4180/mgenetica/';
 for(let i=1;i<=21;i++){
  await page.goto(base+'#course/module-'+String(i).padStart(2,'0'));
  const editor=page.locator('.r-example');await editor.waitFor();
  await page.locator('select[name=locale]').selectOption('pt-BR');
  await editor.getByRole('button',{name:'Executar R',exact:true}).click();
  await editor.getByRole('status').filter({hasText:'Concluído'}).waitFor({timeout:120000});
  assert(await editor.locator('.r-example-output').count());
  if(i===20) assert.equal(await editor.locator('canvas').count(),2);
  console.log('PASS R module '+i+' plots='+await editor.locator('canvas').count());
 }
 const editor=page.locator('.r-example');
 await editor.locator('textarea').fill('stop("teste erro")');
 await editor.getByRole('button',{name:'Executar R',exact:true}).click();
 await editor.locator('.r-example-output').filter({hasText:'teste erro'}).waitFor();
 await editor.locator('textarea').fill('while(TRUE) {}');
 await editor.getByRole('button',{name:'Executar R',exact:true}).click();
 await editor.getByRole('button',{name:'Reiniciar R'}).click();
 await editor.locator('textarea').fill('1 + 1');
 await editor.getByRole('button',{name:'Executar R',exact:true}).click();
 await editor.getByRole('status').filter({hasText:'Concluído'}).waitFor({timeout:120000});
 assert((await editor.locator('.r-example-output').innerText()).includes('2'));
 await page.setViewportSize({width:390,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await browser.close();console.log('PASS error, restart, recovery, mobile');
})().catch(e=>{console.error(e);process.exit(1)});
