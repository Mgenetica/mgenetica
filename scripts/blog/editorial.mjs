import { imageInfo } from './image-info.mjs'
import { realpathSync } from 'node:fs'
import { readFile, writeFile, readdir, mkdir, copyFile, rename, rm, stat } from 'node:fs/promises'
import { resolve, dirname, join } from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..')
const legacySlugs = (await Promise.all(['temperature-performance.json','white-markings.json'].map(async name => { try { return JSON.parse(await readFile(join(root,'frontend/src/data/blog',name),'utf8')).slug } catch(error) { if(error.code==='ENOENT') return null; throw error } }))).filter(Boolean)
const entries=join(root,'frontend/src/data/blog/entries')
const text=value=>typeof value==='string'&&value.trim().length>0
const validURL=value=>{try{return new URL(value).protocol==='https:'}catch{return false}}
export function validatePost(post,{strict=false}={}) {
 const errors=[],warnings=[]
 for(const key of ['slug','title','summary','category','date','takeaway'])if(!text(post[key]))errors.push(`${key}: obrigatório`)
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug||''))errors.push('slug: use letras minúsculas, números e hífens')
 if(!/^\d{4}-\d{2}-\d{2}$/.test(post.date||'')||Number.isNaN(Date.parse(post.date+'T00:00:00Z'))||new Date(post.date+'T00:00:00Z').toISOString().slice(0,10)!==post.date)errors.push('date: data ISO inválida')
 if(post.status&&!['draft','published'].includes(post.status))errors.push('status: draft ou published')
 if(!Array.isArray(post.sections)||!post.sections.length)return {errors:[...errors,'sections: lista obrigatória'],warnings}
 const ids=new Set()
 for(const section of post.sections||[]){
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(section.id||'')||ids.has(section.id))errors.push('id de seção inválido ou repetido');ids.add(section.id)
  if(!text(section.title))errors.push('seção sem título')
  if(!section.paragraphs?.length&&!section.blocks?.length)errors.push('seção sem conteúdo')
  if(section.paragraphs?.some(p=>!text(p)))errors.push('parágrafo inválido')
  for(const b of section.blocks||[])if(!['paragraph','heading','list'].includes(b.type)||!text(b.text))errors.push('bloco inválido')
 }
 for(const b of post.introduction||[])if(!['paragraph','heading','list'].includes(b.type)||!text(b.text))errors.push('introdução inválida')
 if(!Number.isFinite(post.readingMinutes)||post.readingMinutes<1)errors.push('readingMinutes: obrigatório')
 if(post.tags&&(!Array.isArray(post.tags)||post.tags.some(t=>!text(t))))errors.push('tags: lista de textos')
 if(post.sources&&!Array.isArray(post.sources))return {errors:[...errors,'sources: lista obrigatória'],warnings}
 if(!post.sources?.length)warnings.push('referência estruturada ausente: conferir referência no texto original')
 for(const source of post.sources||[])if(!text(source.title)||!validURL(source.url))errors.push('referência: título e URL HTTPS obrigatórios')
 if(!post.cover?.src)warnings.push('capa ausente')
 else {if(!post.cover.src.startsWith('blog/covers/')||post.cover.src.includes('..'))errors.push('capa deve estar em blog/covers/');for(const key of ['alt','credit'])if(!text(post.cover[key]))errors.push(`cover.${key}: obrigatório`);if(!(post.cover.width>0&&post.cover.height>0))errors.push('dimensões de capa obrigatórias')}
 if(strict){if(post.cover?.width<1200||post.cover?.height<630)errors.push('capa de publicação: mínimo 1200 × 630');if(!post.sources?.length)errors.push('publicação nova exige referência estruturada');if(!post.cover?.src)errors.push('publicação nova exige capa');if(!text(post.author))errors.push('publicação nova exige responsável editorial');if(!text(post.seoDescription)||post.seoDescription.length>170)errors.push('descrição SEO obrigatória, até 170 caracteres')}
 return {errors,warnings}
}
export async function collect() {
 await mkdir(entries,{recursive:true})
 const files=(await readdir(entries)).filter(f=>!f.startsWith('.')&&f.endsWith('.json')).sort()
 const result=[];const ids=new Set(legacySlugs)
 for(const file of files){const post=JSON.parse(await readFile(join(entries,file),'utf8'));const report=validatePost(post,{strict:post.status==='published'});if(ids.has(post.slug))report.errors.push('slug já existe');if(report.errors.length)throw new Error(`${file}: ${report.errors.join('; ')}`);ids.add(post.slug);result.push(post)}
 return result
}
async function stageCovers(list) {
 const manifest=join(entries,'.staged-covers.json'),target=join(root,'frontend/public/blog/covers/imported')
 let old=[];try{old=JSON.parse(await readFile(manifest,'utf8'))}catch(error){if(error.code!=='ENOENT')throw error}
 await mkdir(target,{recursive:true})
 for(const name of old){if(!/^[a-z0-9-]+\.(png|webp|jpe?g)$/.test(name))throw new Error('manifesto de capas inválido');await rm(join(target,name),{force:true})}
 const staged=[]
 for(const post of list){if(!post.cover?.src?.startsWith('blog/covers/imported/'))continue;const name=post.cover.src.split('/').pop();await copyFile(join(entries,'assets',name),join(target,name),1);staged.push(name)}
 await writeFile(manifest,JSON.stringify(staged)+'\n')
}
async function main() {
 const [command,input]=process.argv.slice(2)
 if(command==='import'){
  const source=resolve(input||'');const pack=JSON.parse(await readFile(join(source,'article.json'),'utf8'));const post={...pack,status:'draft'}
  const report=validatePost(post);if(report.errors.length)throw new Error(report.errors.join('; '))
  const current=await collect();if(legacySlugs.includes(post.slug)||current.some(p=>p.slug===post.slug))throw new Error('slug já existe; importação não sobrescreve conteúdo')
  const temp=join(entries,`.${post.slug}.tmp`);let copied=null
  try{
   if(post.cover?.src){const name=post.cover.src.split('/').pop();if(!/^[a-z0-9-]+\.(webp|png|jpe?g)$/.test(name))throw new Error('nome/formato de capa inválido');const from=join(source,name);if((await stat(from)).size>2000000)throw new Error('capa acima de 2 MB');const dimensions=imageInfo(await readFile(from));if(dimensions.width!==post.cover.width||dimensions.height!==post.cover.height)throw new Error('dimensões declaradas não correspondem à capa');const to=join(entries,'assets',post.slug+name.slice(name.lastIndexOf('.')));await mkdir(dirname(to),{recursive:true});await copyFile(from,to,1);copied=to;post.cover.src='blog/covers/imported/'+post.slug+name.slice(name.lastIndexOf('.'))}
   const instagram=await readFile(join(source,'instagram.txt'),'utf8');if(instagram.length>2200)throw new Error('legenda acima de 2200 caracteres')
   post.delivery={instagram,sourceSha256:createHash('sha256').update(await readFile(join(source,'article.json'))).digest('hex')}
   await writeFile(temp,JSON.stringify(post,null,2)+'\n',{flag:'wx'});await rename(temp,join(entries,post.slug+'.json'))
   console.log(JSON.stringify({imported:post.slug,status:'draft',warnings:report.warnings}))
  }catch(e){await rm(temp,{force:true});if(copied)await rm(copied,{force:true});throw e}
 }else if(command==='prepare'||command==='check'){
  const list=await collect();await stageCovers(list.filter(p=>process.env.VITE_BLOG_DRAFTS==='true'||p.status==='published'));await writeFile(join(root,'frontend/src/data/blog/entries.generated.json'),JSON.stringify(list.filter(p=>process.env.VITE_BLOG_DRAFTS==='true'||p.status==='published').map(({delivery,...post})=>post),null,2)+'\n');console.log(JSON.stringify({entries:list.length,drafts:list.filter(p=>p.status==='draft').length,published:list.filter(p=>p.status==='published').length}))
 }else if(command==='plan'){
  const list=await collect();const legacy=JSON.parse(await readFile(join(root,'frontend/src/data/blog/temperature-performance.json'),'utf8'));const plan={legacyWarnings:validatePost(legacy).warnings,generatedAt:new Date().toISOString(),mode:'local-only',items:list.map(post=>({slug:post.slug,status:post.status,...validatePost(post,{strict:true})})),next:['Revisar conteúdo e capa na prévia de rascunhos','Após aprovação editorial, alterar status para published e conferir a data','Executar prepublish e testes do blog em checkout isolado','Commit/PR/publicação somente após solicitação explícita']};await writeFile(join(root,'docs/site/editorial-release-plan.json'),JSON.stringify(plan,null,2)+'\n');console.log(JSON.stringify(plan))
 }else throw new Error('Use import PASTA, prepare, check ou plan')
}
if(process.argv[1]&&realpathSync(process.argv[1])===realpathSync(fileURLToPath(import.meta.url)))main().catch(e=>{console.error(e.message);process.exitCode=1})
