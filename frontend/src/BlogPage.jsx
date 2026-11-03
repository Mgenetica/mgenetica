import React, { useEffect, useRef, useState } from 'react'
const blogBase = import.meta.env.BASE_URL
const postHref = slug => blogBase + 'blog/' + slug + '/'
import { posts, filterPosts } from './data/blog/posts.mjs'
import './blog.css'
import BlogCover from './components/BlogCover'
import ArticleActions from './components/ArticleActions'
import ReadingPreferences from './components/ReadingPreferences'
function InlineText({ text, links = true }) {
  const pattern = links ? /(\[[^\]]+\]\(https:\/\/[^\s)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|https:\/\/[^\s)]+)/g : /(\*\*[^*]+\*\*|\*[^*]+\*)/g
  return String(text).split(pattern).map((part, i) => {
    const link = links && part.match(/^\[([^\]]+)\]\((https:\/\/[^\s)]+)\)$/)
    return link ? <a key={i} href={link[2]}><InlineText text={link[1]} links={false} /></a> : part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part.startsWith('*') ? <em key={i}>{part.slice(1, -1)}</em> : links && part.startsWith('https://') ? <a key={i} href={part}>{part}</a> : part
  })
}
function Blocks({ blocks }) {
  return blocks.map((block, i) => block.type === 'table' ? <div className="blog-table-wrap" key={i}><table><thead><tr>{block.headers.map((cell, j) => <th key={j} scope="col"><InlineText text={cell} /></th>)}</tr></thead><tbody>{block.rows.map((row, j) => <tr key={j}>{row.map((cell, k) => k === 0 ? <th key={k} scope="row"><InlineText text={cell} /></th> : <td key={k}><InlineText text={cell} /></td>)}</tr>)}</tbody></table></div> : block.type === 'heading' ? <h3 key={i}><InlineText text={block.text} /></h3> : block.type === 'list' ? <ul key={i}>{block.text.split('\n').map((item, j) => <li key={j}><InlineText text={item.replace(/^- /, '')} /></li>)}</ul> : <p key={i}><InlineText text={block.text} /></p>)
}
const dateLabel = date => new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(date + 'T00:00:00Z'))
export default function BlogPage({ slug, locale = 'pt-BR', unavailable = false }) {
  const [query, setQuery] = useState(''), [category, setCategory] = useState('Todos')
  const heading = useRef(null)
  const post = posts.find(p => p.slug === slug)
  useEffect(() => {
    const previous = document.title
    document.title = unavailable ? 'Curso em preparação | MGenética' : slug ? `${post?.seoTitle || post?.title || 'Artigo não encontrado'} | MGenética` : 'MGenética — Genética e ciência em linguagem acessível'
    const anchor = document.getElementById(decodeURIComponent(window.location.hash.slice(1)))
    if (anchor) { anchor.focus({ preventScroll: true }); anchor.scrollIntoView() }
    else { heading.current?.focus(); window.scrollTo(0, 0) }
    return () => { document.title = previous }
  }, [slug, unavailable])
  useEffect(() => {
    if (slug) return
    const params = new URLSearchParams(window.location.search)
    setQuery(params.get('q') || '')
    setCategory(params.get('assunto') || 'Todos')
  }, [slug])
  function updateSearch(value, subject = category) {
    setQuery(value); setCategory(subject)
    const url = new URL(window.location.href)
    value ? url.searchParams.set('q',value) : url.searchParams.delete('q')
    subject !== 'Todos' ? url.searchParams.set('assunto',subject) : url.searchParams.delete('assunto')
    window.history.replaceState(null,'',url)
  }
  const visible = filterPosts(query, category)
  const meta = p => <div className="blog-meta"><span>{p.category}</span><time dateTime={p.date}>{dateLabel(p.date)}</time><span>{p.readingMinutes} min de leitura</span></div>
  return <div className="app-shell blog-shell">
    <a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); document.getElementById('main-content')?.focus() }}>Pular para o conteúdo</a>
    <header className="editorial-header">
      <a className="editorial-brand" href={blogBase}><img src={blogBase + 'brand/mgenetica-logo-correct.png'} width="48" height="48" alt="" /><span>MGenética<small>Genética em linguagem acessível</small></span></a>
      <nav aria-label="Navegação principal"><a href={blogBase} aria-current={!slug ? 'page' : undefined}>Artigos</a><a href={blogBase + '#sobre'}>Sobre</a><a href={blogBase + '#buscar'}>Buscar</a></nav>
    </header>
    {posts.some(p => p.status === 'draft') && <aside className="draft-notice" role="note">Prévia local com rascunhos. Este conteúdo não faz parte da versão pública.</aside>}
    <main id="main-content" lang="pt-BR" tabIndex={-1}>
      {unavailable ? <section className="blog-article"><h1 ref={heading} tabIndex={-1}>Esta página está em preparação</h1><p>Enquanto o curso é preparado, explore os textos de divulgação científica.</p><a href={blogBase}>Conhecer o blog →</a></section> : slug ? post ? <article className="blog-article">
        <nav className="blog-breadcrumb" aria-label="Você está aqui"><a href={blogBase}>Artigos</a><span aria-hidden="true"> / </span><span aria-current="page">{post.title}</span></nav>
        <header><div className="section-label">Artigo explicado</div>{meta(post)}<h1 ref={heading} tabIndex={-1}>{post.title}</h1><p className="blog-deck">{post.summary}</p><p className="blog-byline">Publicado por {post.author || 'MGenética'} · Divulgação científica</p><div className="reader-tools"><ArticleActions /><ReadingPreferences /></div></header>
        {post.cover?.src && <BlogCover cover={post.cover} title={post.title} hero />}
        <aside className="blog-takeaway"><strong>A ideia central</strong><p>{post.takeaway}</p></aside>
        <div className="blog-reading-layout">
        <nav className="blog-toc" aria-label="Sumário do artigo"><strong>Navegue pelo artigo</strong>{post.sections.map(s => <a key={s.id} href={'#' + s.id} onClick={e => { e.preventDefault(); const el = document.getElementById(s.id); el?.focus({ preventScroll: true }); window.history.replaceState(null, '', '#' + s.id); el?.scrollIntoView({ behavior: 'instant', block: 'start' }) }}>{s.title}</a>)}</nav>
        <div className="blog-prose">
        {post.introduction && <div className="blog-introduction"><Blocks blocks={post.introduction} /></div>}
        {post.sections.map(s => <section key={s.id}><h2 id={s.id} tabIndex={-1}>{s.title}</h2>{s.blocks ? <Blocks blocks={s.blocks} /> : s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</section>)}
        </div>
        </div>

        {posts.length > 1 && <section className="blog-related"><h2>Continue a leitura</h2>{posts.filter(p => p.slug !== slug).map(p => <a key={p.slug} href={postHref(p.slug)}>{p.title} →</a>)}</section>}
      </article> : <section className="blog-article"><h1 ref={heading} tabIndex={-1}>Artigo não encontrado</h1><p>Este endereço não corresponde a um texto do blog.</p><a className="btn btn-primary" href={blogBase}>Voltar ao blog</a></section> : <>
        <header className="blog-intro"><div className="section-label">Genética · Animais · Ambiente</div><h1 ref={heading} tabIndex={-1}>Genética, sem complicar.<br /><em>Ciência, com contexto.</em></h1><p>O que as pesquisas revelam sobre os animais e o mundo em que vivem? Entenda os resultados, os conceitos e os limites de cada descoberta.</p><a className="editorial-button" href="#artigos">Explorar os artigos <span aria-hidden="true">→</span></a>{locale !== 'pt-BR' && <p className="blog-language-note">Os textos do blog estão disponíveis em português.</p>}</header>
        <section id="buscar" tabIndex={-1} aria-label="Buscar artigos" className="blog-filters"><label htmlFor="blog-search">Encontre uma leitura<input id="blog-search" type="search" placeholder="Busque por assunto ou palavra-chave" value={query} onChange={e => updateSearch(e.target.value)} /></label>{new Set(posts.map(p => p.category)).size > 1 && <div className="blog-categories" aria-label="Filtrar por tema">{['Todos', ...new Set(posts.map(p => p.category))].map(c => <button key={c} type="button" aria-pressed={category === c} onClick={() => updateSearch(query,c)}>{c === 'Todos' ? 'Todos os assuntos' : c}</button>)}</div>}</section>
        <div className="blog-list-heading" id="artigos" tabIndex={-1}><h2>Artigos para explorar</h2><p role="status" className="blog-count">{visible.length} {visible.length === 1 ? 'artigo disponível' : 'artigos disponíveis'}</p></div>
        <div className="blog-grid">{visible.map((p, i) => <article className={'blog-card ' + (i === 0 && !query && category === 'Todos' ? 'blog-featured' : '')} key={p.slug}><a className="blog-cover-link" href={postHref(p.slug)} tabIndex={-1} aria-hidden="true"><BlogCover cover={p.cover} title={p.title} /></a><div className="blog-card-content">{meta(p)}<h2><a href={postHref(p.slug)}>{p.title}</a></h2><p>{p.summary}</p><a className="blog-read" href={postHref(p.slug)} aria-label={'Ler: ' + p.title}>Ler artigo completo <span aria-hidden="true">↗</span></a></div></article>)}</div>
        {!visible.length && <div className="blog-empty"><h2>Não encontramos esse assunto</h2><p>Tente uma palavra mais ampla ou volte à lista completa.</p><button className="btn btn-secondary" onClick={() => { updateSearch('', 'Todos') }}>Ver todos os artigos</button></div>}

      </>}
    {!slug && !unavailable && <section className="blog-about" id="sobre" tabIndex={-1}><div className="section-label">Sobre o MGenética</div><h2>Pesquisa científica.<br />Conversa aberta.</h2><p>O MGenética aproxima a pesquisa em genética e ciência animal de quem tem curiosidade sobre o tema. Você não precisa conhecer os termos técnicos para começar: nossa proposta é explicá-los ao longo da leitura.</p><p>Aqui, os textos partem de artigos científicos e apresentam seus resultados no contexto em que foram obtidos. A referência acompanha a publicação para que você possa consultar a pesquisa original.</p></section>}
    {!slug && !unavailable && <section className="editorial-principles" id="criterios" tabIndex={-1}><div><div className="section-label">Nosso compromisso</div><h2>Clareza para ler.<br />Contexto para interpretar.</h2></div><ol><li><strong>O estudo como ponto de partida</strong><p>A referência permite localizar a pesquisa que deu origem ao texto.</p></li><li><strong>Resultados com seus limites</strong><p>População, ambiente e método importam para interpretar uma descoberta.</p></li><li><strong>Linguagem que aproxima</strong><p>Conceitos explicados para quem quer aprender, mesmo sem formação na área.</p></li></ol></section>}
    </main><footer className="blog-footer"><span>MGenética<br /><small>Genética em linguagem acessível.</small></span><nav aria-label="Navegação do rodapé"><a href={blogBase}>Todos os artigos</a><a href={blogBase + '#criterios'}>Critérios editoriais</a><a href={blogBase + '#sobre'}>Sobre o projeto</a><a href={blogBase + 'feed.xml'}>Acompanhar por RSS</a></nav></footer>
  </div>
}
