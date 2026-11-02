import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, copyFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { validatePost } from '../../scripts/blog/editorial.mjs'
import { searchPosts,visiblePosts } from '../src/data/blog/catalog.mjs'
const sample={slug:'teste-editorial',title:'Teste editorial',summary:'Resumo para teste',category:'Genética',date:'2026-01-01',takeaway:'Ideia central',readingMinutes:2,sections:[{id:'achados',title:'Achados',paragraphs:['Uma norma de reação explica o ambiente.']}],sources:[{title:'Artigo científico',url:'https://doi.org/10.1234/test'}]}
test('busca encontra corpo e termos sem acento; todos os termos precisam corresponder',()=>{assert.equal(searchPosts([sample],'reacao ambiente').length,1);assert.equal(searchPosts([sample],'reacao inexistente').length,0)})
test('rascunhos e datas futuras ficam fora do catálogo público',()=>{assert.equal(visiblePosts([{...sample,status:'draft'},{...sample,date:'2099-01-01'}]).length,0)})
test('validação bloqueia duplicação de seções, fontes inseguras e caminhos de capa',()=>{const bad={...sample,sections:[...sample.sections,...sample.sections],sources:[{title:'X',url:'javascript:alert(1)'}],cover:{src:'blog/covers/../../fora.png'}};assert(validatePost(bad).errors.length>=3);assert(validatePost(sample,{strict:true}).errors.some(e=>e.includes('capa')))})
test('importação preserva origem, recusa colisão e build normal exclui rascunhos e legenda',async()=>{
 const root=await mkdtemp(join(tmpdir(),'mgenetica-editorial-'))
 try{
  await mkdir(join(root,'scripts/blog'),{recursive:true});await mkdir(join(root,'frontend/src/data/blog'),{recursive:true});await mkdir(join(root,'docs/site'),{recursive:true});await mkdir(join(root,'package'))
  const cli=join(root,'scripts/blog/editorial.mjs');await copyFile(resolve('../scripts/blog/editorial.mjs'),cli);await copyFile(resolve('../scripts/blog/image-info.mjs'),join(root,'scripts/blog/image-info.mjs'));await writeFile(join(root,'frontend/src/data/blog/temperature-performance.json'),JSON.stringify({...sample,slug:"artigo-existente"}))
  const json=JSON.stringify(sample);await writeFile(join(root,'package/article.json'),json);await writeFile(join(root,'package/instagram.txt'),'Legenda de teste')
  execFileSync(process.execPath,[cli,'import',join(root,'package')]);assert.equal(await readFile(join(root,'package/article.json'),'utf8'),json)
  assert.throws(()=>execFileSync(process.execPath,[cli,'import',join(root,'package')],{stdio:'pipe'}))
  execFileSync(process.execPath,[cli,'prepare'],{env:{...process.env,VITE_BLOG_DRAFTS:'false'}});assert.deepEqual(JSON.parse(await readFile(join(root,'frontend/src/data/blog/entries.generated.json'),'utf8')),[])
  execFileSync(process.execPath,[cli,'prepare'],{env:{...process.env,VITE_BLOG_DRAFTS:'true'}});const drafts=JSON.parse(await readFile(join(root,'frontend/src/data/blog/entries.generated.json'),'utf8'));assert.equal(drafts.length,1);assert.equal(drafts[0].delivery,undefined)
  execFileSync(process.execPath,[cli,'plan']);assert(JSON.parse(await readFile(join(root,'docs/site/editorial-release-plan.json'),'utf8')).items[0].errors.length>0)
 }finally{await rm(root,{recursive:true,force:true})}
})
