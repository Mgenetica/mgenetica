import { createServer } from 'vite'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { posts } from '../src/data/blog/posts.mjs'
const root = resolve(import.meta.dirname, '..')
const draftPreview = process.env.VITE_BLOG_DRAFTS === 'true'
const origin = process.env.VITE_PUBLIC_SITE_URL || 'https://www.mgenetica.com/'
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const server = await createServer({ root, server: { middlewareMode: true, hmr: false, ws: false }, optimizeDeps: { noDiscovery: true, entries: [] }, appType: 'custom' })
try {
  const { default: BlogPage } = await server.ssrLoadModule('/src/BlogPage.jsx')
  const template = await readFile(resolve(root,'dist/index.html'),'utf8')
  const routes = [{path:'',post:null},{path:'blog/',post:null},...posts.map(post=>({path:`blog/${post.slug}/`,post})),{path:'404.html',unavailable:true}]
  for (const route of routes) {
    const title = route.unavailable ? 'Página não encontrada | MGenética' : route.post ? `${route.post.seoTitle || route.post.title} | MGenética` : 'MGenética — Genética e ciência em linguagem acessível'
    const fullDescription = route.post?.seoDescription || route.post?.summary || 'Artigos científicos explicados para o público geral. Genética, animais e ambiente com contexto, clareza e respeito às evidências.'
    const description = fullDescription.length > 160 ? fullDescription.slice(0,157).replace(/\s+\S*$/, '') + '…' : fullDescription
    const url = new URL(route.path === 'blog/' ? '' : route.path,origin).href
    const image = route.post?.cover?.src ? new URL(route.post.cover.src,origin).href : null
    const schema = route.post ? {'@context':'https://schema.org','@type':'BlogPosting',headline:route.post.title,description,datePublished:route.post.date,inLanguage:'pt-BR',mainEntityOfPage:url,author:{'@type':'Organization',name:route.post.author || 'MGenética'},...(route.post.updatedAt?{dateModified:route.post.updatedAt}:{}),publisher:{'@type':'Organization',name:'MGenética'},...(image?{image:[image]}:{})} : {'@context':'https://schema.org','@type':'Blog',name:'MGenética',url,description,inLanguage:'pt-BR'}
    const metadata = `<meta name="description" content="${escape(description)}"><meta name="robots" content="${route.unavailable||draftPreview?'noindex,follow':'index,follow,max-image-preview:large'}"><link rel="canonical" href="${escape(url)}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${escape(url)}"><meta property="og:type" content="${route.post?'article':'website'}"><meta property="og:site_name" content="MGenética"><meta property="og:locale" content="pt_BR"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:card" content="${image?'summary_large_image':'summary'}">${image?`<meta name="twitter:image" content="${escape(image)}"><meta name="twitter:image:alt" content="${escape(route.post.cover.alt || route.post.title)}"><meta property="og:image:width" content="${route.post.cover.width}"><meta property="og:image:height" content="${route.post.cover.height}"><meta property="og:image" content="${escape(image)}"><meta property="og:image:alt" content="${escape(route.post.cover.alt || route.post.title)}">`:''}<script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script>`
    const breadcrumb = route.post ? `<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Artigos',item:origin},{'@type':'ListItem',position:2,name:route.post.title,item:url}]}).replace(/</g,'\\u003c')}</script>` : ''
    const markup = renderToString(React.createElement(BlogPage,{slug:route.unavailable?'__not-found__':route.post?.slug||'',unavailable:false,locale:'pt-BR'}))
    const html = template.replace('<html>','<html lang="pt-BR">').replace(/<title>.*?<\/title>/,`<title>${escape(title)}</title>`).replace('</head>',metadata+breadcrumb+`<link rel="alternate" type="application/rss+xml" title="MGenética" href="${new URL('feed.xml',origin).href}">`+'</head>').replace('<div id="root"></div>',`<div id="root">${markup}</div>`)
    const file = resolve(root,'dist',route.path.endsWith('.html')?route.path:route.path+'index.html')
    await mkdir(resolve(file,'..'),{recursive:true});await writeFile(file,html)
  }
  await writeFile(resolve(root,'dist/sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.filter(r=>!r.unavailable&&r.path!=='blog/'&&r.post?.status!=='draft').map(r=>`<url><loc>${escape(new URL(r.path,origin).href)}</loc></url>`).join('')}</urlset>`)
  await writeFile(resolve(root,'dist/robots.txt'),`User-agent: *\n${draftPreview?'Disallow: /':'Allow: /'}\nSitemap: ${new URL('sitemap.xml',origin).href}\n`)
  const feedPosts=posts.filter(p=>p.status!=='draft')
  await writeFile(resolve(root,'dist/feed.xml'),`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>MGenética</title><link>${escape(origin)}</link><description>Genética em linguagem acessível</description><language>pt-BR</language>${feedPosts.map(p=>{const url=new URL('blog/'+p.slug+'/',origin).href;return `<item><title>${escape(p.title)}</title><link>${escape(url)}</link><guid isPermaLink="true">${escape(url)}</guid><description>${escape(p.summary)}</description><pubDate>${new Date(p.date+'T00:00:00Z').toUTCString()}</pubDate></item>`}).join('')}</channel></rss>`)
  console.log(`Generated ${routes.length} HTML pages, sitemap and robots.txt`)
} finally { await server.close() }
