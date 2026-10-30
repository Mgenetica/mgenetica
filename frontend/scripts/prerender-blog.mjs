import { build } from 'vite'
import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { posts } from '../src/data/blog/posts.mjs'

const base = process.env.VITE_APP_BASE || '/mgenetica/'
const site = new URL(process.env.VITE_PUBLIC_SITE_URL || 'https://www.mgenetica.com/')
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const url = path => new URL(path, site).href
await build({ build: { ssr: 'src/blog-prerender.jsx', outDir: '.blog-ssr', emptyOutDir: true } })
const { renderBlog } = await import(pathToFileURL(resolve('.blog-ssr/blog-prerender.mjs')))
const template = await readFile('dist/index.html', 'utf8')
const styles = (await readdir('dist/assets')).filter(f => /^BlogPage-.*\.css$/.test(f)).map(f => `<link rel="stylesheet" href="${base}assets/${f}">`).join('\n')
const pages = [{ slug: '', title: 'Blog MGenética: genética em linguagem clara', summary: 'Artigos sobre genética, com explicações acessíveis, referências científicas e os limites de cada estudo.' }, ...posts]
for (const post of pages) {
  const canonical = url(`blog/${post.slug ? post.slug + '/' : ''}`)
  const description = post.seoDescription || post.summary
  const image = post.cover ? url(post.cover.src) : null
  const schema = post.slug ? {
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title,
    description, url: canonical, mainEntityOfPage: canonical, inLanguage: 'pt-BR',
    datePublished: post.date, ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
    author: { '@type': 'Organization', name: post.author || 'MGenética', url: site.href },
    publisher: { '@type': 'Organization', name: 'MGenética', url: site.href },
    ...(image ? { image: [image] } : {})
  } : { '@context': 'https://schema.org', '@type': 'CollectionPage', name: post.title, url: canonical, inLanguage: 'pt-BR' }
  const metadata = `<meta name="description" content="${escape(description)}">
<link rel="canonical" href="${escape(canonical)}">
<meta property="og:type" content="${post.slug ? 'article' : 'website'}">
<meta property="og:title" content="${escape(post.title)}">
<meta property="og:description" content="${escape(description)}">
<meta property="og:url" content="${escape(canonical)}">
<meta property="og:site_name" content="MGenética">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">
${image ? `<meta property="og:image" content="${escape(image)}"><meta property="og:image:alt" content="${escape(post.cover.alt)}"><meta property="og:image:width" content="${post.cover.width}"><meta property="og:image:height" content="${post.cover.height}">` : ''}
<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>
${styles}`
  const html = template.replace('<html>', '<html lang="pt-BR">').replace(/<title>.*?<\/title>/s, `<title>${escape(post.seoTitle || post.title)} | MGenética</title>`).replace('</head>', metadata + '\n</head>').replace('<div id="root"></div>', `<div id="root">${renderBlog(post.slug)}</div>`)
  const directory = resolve('dist/blog', post.slug)
  await mkdir(directory, { recursive: true }); await writeFile(resolve(directory, 'index.html'), html)
}
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(site.href)}</loc></url>${pages.map(p => `<url><loc>${escape(url(`blog/${p.slug ? p.slug + '/' : ''}`))}</loc></url>`).join('')}</urlset>\n`)
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${url('sitemap.xml')}\n`)
await rm('.blog-ssr', { recursive: true, force: true })
console.log(`Prerendered ${pages.length} blog pages with canonical metadata and sitemap`)
