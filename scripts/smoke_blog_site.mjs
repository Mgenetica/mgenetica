import assert from 'node:assert/strict'
import { posts } from '../frontend/src/data/blog/posts.mjs'
const base = new URL(process.argv[2] || 'https://www.mgenetica.com/')
async function get(path) { const response=await fetch(new URL(path,base)); assert(response.ok,`${path}: HTTP ${response.status}`); return response.text() }
const home=await get('')
assert(home.includes('Genética, sem complicar.'))
assert(!home.includes('noindex'))
assert(!home.includes('Prévia local com rascunhos'))
const sitemap=await get('sitemap.xml'), feed=await get('feed.xml')
assert.equal((feed.match(/<item>/g)||[]).length,posts.length)
for(const post of posts){
 const path=`blog/${post.slug}/`, html=await get(path)
 assert(html.includes('blog-prose')); assert(html.includes(post.sections[0].id))
 assert(html.includes('BlogPosting')); assert(html.includes('BreadcrumbList'))
 assert(!html.includes('noindex')); assert(sitemap.includes(path)); assert(feed.includes(path))
 if(post.cover){const response=await fetch(new URL(post.cover.src,base));assert(response.ok);assert(response.headers.get('content-type')?.startsWith('image/'))}
 if(post.sections.some(s=>s.blocks?.some(b=>b.type==='table')))assert(html.includes('<table>'),'Tabela do artigo precisa estar preservada')
}
console.log(`Blog OK: página inicial, ${posts.length} artigos, tabelas, capas, SEO, sitemap e RSS`)
