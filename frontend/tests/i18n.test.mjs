import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createHash } from 'node:crypto'
const root = new URL('../',import.meta.url)
const source = JSON.parse(fs.readFileSync(new URL('src/data/legacy-curriculum.generated.json',root),'utf8'))
function inlineCode(text){return String(text).match(/`[^`]+`/g)||[]}
function strings(value){return typeof value==='string'?[value]:Array.isArray(value)?value.flatMap(strings):value&&typeof value==='object'?Object.values(value).flatMap(strings):[]}
function htmlTags(text){return text.match(/<[A-Za-z/][^>]*(?:>|$)/g)||[]}
function mathSymbols(text){return text.replace(/`[^`]*`|<[A-Za-z/][^>]*(?:>|$)/g,'').match(/[≥≤≈≠><→←±×÷]/g)?.sort()||[]}
function numbers(text){return text.match(/\d+(?:[.,:]\d+)*/g)?.sort()||[]}
function scientificIdentifiers(text){return (text.match(/\b(?:VP|VA|VE|VD|VI|EBV|DEP|BLUP|GWAS|SNPs?|QC|MAF|HWE|Ne|rA|rP|rE)\b/g)||[]).map(s=>s==='SNPs'?'SNP':s).sort()}
for(const locale of ['en','es'])test(`${locale}: all module translations preserve inline scientific code`,()=>{
 const translated=JSON.parse(fs.readFileSync(new URL(`src/data/courseTranslations/${locale}.json`,root),'utf8'))
 assert.equal(Object.keys(translated).length,21)
 for(const row of source.modules){
  const target=translated[row.id];assert.ok(target,row.id)
  for(const [field,value]of Object.entries(target)){
   const before=strings(row[field]),after=strings(value)
   assert.equal(after.length,before.length,`${row.id}/${field}: structure changed`)
   for(let i=0;i<before.length;i++){
    if(before[i].trim())assert.ok(after[i].trim(),`${row.id}/${field}: missing text`)
    assert.deepEqual(inlineCode(after[i]).sort(),inlineCode(before[i]).sort(),`${row.id}/${field}: scientific code changed`)
   }
  }
 }
})
test('all labs have complete language dictionaries and unchanged scientific input data',()=>{
 const plan=JSON.parse(fs.readFileSync(new URL('lab-i18n/source-plan.json',root),'utf8'))
 for(const file of Object.keys(plan.labs)){
  const html=fs.readFileSync(new URL(`public/labs/${file}`,root),'utf8')
  const dictionary=JSON.parse(html.match(/<script type="application\/json" id="i18n">([\s\S]*?)<\/script>/)[1])
  for(const lang of ['en','es']){
   assert.deepEqual(Object.keys(dictionary[lang]).sort(),Object.keys(dictionary['pt-BR']).sort(),file)
   for(const key of Object.keys(dictionary['pt-BR'])){
    assert.deepEqual(htmlTags(dictionary[lang][key]),htmlTags(dictionary['pt-BR'][key]),`${file}/${lang}/${key}: markup changed`)
    assert.deepEqual(mathSymbols(dictionary[lang][key]),mathSymbols(dictionary['pt-BR'][key]),`${file}/${lang}/${key}: mathematical relation changed`)
    assert.deepEqual(numbers(dictionary[lang][key]),numbers(dictionary['pt-BR'][key]),`${file}/${lang}/${key}: numeric explanation changed`)
    assert.deepEqual(scientificIdentifiers(dictionary[lang][key]),scientificIdentifiers(dictionary['pt-BR'][key]),`${file}/${lang}/${key}: scientific identifier changed`)
   }
  }
  assert.match(html,/ev\.source === parent/)
  assert.match(html,/mg-language-refresh/)
  const data=html.match(/<script type="application\/json" id="dados">([\s\S]*?)<\/script>/)[1]
  assert.equal(createHash('sha256').update(data).digest('hex'),plan.labs[file].dataSha256,`${file}: scientific dataset changed`)
 }
})
