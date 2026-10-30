import React, { useEffect, useRef, useState } from 'react'
import AppHeader from './components/AppHeader'
import { posts, filterPosts } from './data/blog/posts.mjs'
import './blog.css'
import BlogCover from './components/BlogCover'
function InlineText({ text }) {
  return String(text).split(/(\*\*[^*]+\*\*|\*[^*]+\*|https:\/\/[^\s]+)/g).map((part, i) => part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part.startsWith('*') ? <em key={i}>{part.slice(1, -1)}</em> : part.startsWith('https://') ? <a key={i} href={part}>{part}</a> : part)
}
function Blocks({ blocks }) {
  return blocks.map((block, i) => block.type === 'table' ? <div className="blog-table-wrap" key={i}><table><thead><tr>{block.headers.map((cell, j) => <th key={j} scope="col"><InlineText text={cell} /></th>)}</tr></thead><tbody>{block.rows.map((row, j) => <tr key={j}>{row.map((cell, k) => k === 0 ? <th key={k} scope="row"><InlineText text={cell} /></th> : <td key={k}><InlineText text={cell} /></td>)}</tr>)}</tbody></table></div> : block.type === 'heading' ? <h3 key={i}><InlineText text={block.text} /></h3> : block.type === 'list' ? <ul key={i}>{block.text.split('\n').map((item, j) => <li key={j}><InlineText text={item.replace(/^- /, '')} /></li>)}</ul> : <p key={i}><InlineText text={block.text} /></p>)
}
const siteBase = import.meta.env.BASE_URL
const blogHref = slug => `${siteBase}blog/${slug ? slug + '/' : ''}`
const dateLabel = date => new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(date + 'T00:00:00Z'))
export default function BlogPage({ slug, locale, onLocaleChange, t }) {
  const [query, setQuery] = useState(''), [category, setCategory] = useState('Todos')
  const heading = useRef(null)
  const post = posts.find(p => p.slug === slug)
  useEffect(() => {
    const previous = document.title
    const description = document.querySelector('meta[name=description]')
    const previousDescription = description?.content
    if (description) description.content = post?.seoDescription || post?.summary || 'Artigos de genética em linguagem clara, com referências científicas.'
    document.title = `${slug ? post?.seoTitle || post?.title || 'Artigo não encontrado' : 'Blog · Ciência para entender'} | MGenética`
    heading.current?.focus()
    window.scrollTo(0, 0)
    return () => { document.title = previous; if (description) description.content = previousDescription }
  }, [slug])
  const visible = filterPosts(query, category)
  const meta = p => <div className="blog-meta"><span>{p.category}</span><time dateTime={p.date}>{dateLabel(p.date)}</time><span>{p.readingMinutes} min de leitura</span></div>
  return <div className="app-shell blog-shell">
    <a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); document.getElementById('main-content')?.focus() }}>Pular para o conteúdo</a>
    <AppHeader brandName={t('common.brandName')} brandTagline={t('common.brandTagline')} locale={locale} onLocaleChange={onLocaleChange} t={t} homeHref={siteBase}>
      <nav aria-label="Navegação do site" className="blog-nav"><a href={siteBase}>Início</a><a href={blogHref()} aria-current={!slug ? 'page' : undefined}>Blog</a><a href={siteBase + '#catalog'}>Curso aberto</a></nav>
    </AppHeader>
    <main id="main-content" lang="pt-BR" tabIndex={-1}>
      {slug ? post ? <article className="blog-article">
        <a className="blog-back" href={blogHref()}>← Todos os textos</a>
        <header>{meta(post)}<h1 ref={heading} tabIndex={-1}>{post.title}</h1><p className="blog-deck">{post.summary}</p><p className="blog-byline">MGenética · Divulgação científica</p></header>
        <BlogCover cover={post.cover} title={post.title} hero />
        <aside className="blog-takeaway"><strong>Para guardar</strong><p>{post.takeaway}</p></aside>
        <div className="blog-reading-layout">
        <nav className="blog-toc" aria-label="Neste texto"><strong>Neste texto</strong>{post.sections.map(s => <a key={s.id} href={'#' + s.id} onClick={e => { e.preventDefault(); const el = document.getElementById(s.id); el?.focus(); el?.scrollIntoView({ behavior: 'instant', block: 'start' }) }}>{s.title}</a>)}</nav>
        <div className="blog-prose">
        {post.introduction && <div className="blog-introduction"><Blocks blocks={post.introduction} /></div>}
        {post.sections.map(s => <section key={s.id}><h2 id={s.id} tabIndex={-1}>{s.title}</h2>{s.blocks ? <Blocks blocks={s.blocks} /> : s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</section>)}
        </div>
        </div>
        <aside className="blog-course"><h2>Da leitura à prática</h2><p>Explore o tema no curso aberto, com explicações e laboratório interativo.</p><a className="btn btn-primary" href={siteBase + '#course/' + post.module}>Explorar módulo do curso →</a></aside>
        {posts.length > 1 && <section className="blog-related"><h2>Continue a leitura</h2>{posts.filter(p => p.slug !== slug).map(p => <a key={p.slug} href={blogHref(p.slug)}>{p.title} →</a>)}</section>}
      </article> : <section className="blog-article"><h1 ref={heading} tabIndex={-1}>Artigo não encontrado</h1><p>Este endereço não corresponde a um texto do blog.</p><a className="btn btn-primary" href={blogHref()}>Voltar ao blog</a></section> : <>
        <header className="blog-intro"><div className="section-label">Blog MGenética</div><h1 ref={heading} tabIndex={-1}>Ciência para entender.<br /><em>Ideias para levar consigo.</em></h1><p>Genética em linguagem clara. Textos para aproximar a ciência da vida, sem perder de vista as evidências.</p>{locale !== 'pt-BR' && <p className="blog-language-note">Os textos do blog estão disponíveis em português.</p>}</header>
        <section aria-label="Encontrar textos" className="blog-filters"><label htmlFor="blog-search">Buscar no blog<input id="blog-search" type="search" placeholder="Tema ou palavra-chave" value={query} onChange={e => setQuery(e.target.value)} /></label><div className="blog-categories" aria-label="Filtrar por tema">{['Todos', ...new Set(posts.map(p => p.category))].map(c => <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>)}</div></section>
        <p role="status" className="blog-count">{visible.length} {visible.length === 1 ? 'texto encontrado' : 'textos encontrados'}</p>
        <div className="blog-grid">{visible.map((p, i) => <article className={'blog-card ' + (i === 0 && !query && category === 'Todos' ? 'blog-featured' : '')} key={p.slug}><a className="blog-cover-link" href={blogHref(p.slug)} tabIndex={-1} aria-hidden="true"><BlogCover cover={p.cover} title={p.title} /></a><div className="blog-card-content">{meta(p)}<h2><a href={blogHref(p.slug)}>{p.title}</a></h2><p>{p.summary}</p><a className="blog-read" href={blogHref(p.slug)} aria-label={'Ler: ' + p.title}>Ler texto <span aria-hidden="true">↗</span></a></div></article>)}</div>
        {!visible.length && <div className="blog-empty"><h2>Nenhum texto com esses filtros</h2><p>Tente outra palavra ou explore todos os temas.</p><button className="btn btn-secondary" onClick={() => { setQuery(''); setCategory('Todos') }}>Limpar filtros</button></div>}
        <aside className="blog-course"><div><h2>Quer experimentar os conceitos?</h2><p>Conheça os 21 módulos e laboratórios do curso aberto.</p></div><a className="btn btn-primary" href={siteBase + '#catalog'}>Explorar o curso →</a></aside>
      </>}
    </main><footer className="blog-footer"><span>MGenética · Ciência com clareza</span><a href={siteBase}>Voltar ao início ↑</a></footer>
  </div>
}
