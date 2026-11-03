import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { resolve } from 'node:path'

test('artigo preserva links descritivos, ênfase e DOI sem criar âncoras aninhadas', async () => {
  const server = await createServer({ root: resolve(import.meta.dirname, '..'), server: { middlewareMode: true, hmr: false, ws: false }, optimizeDeps: { noDiscovery: true, entries: [] }, appType: 'custom' })
  try {
    const { default: BlogPage } = await server.ssrLoadModule('/src/BlogPage.jsx')
    const html = renderToStaticMarkup(React.createElement(BlogPage, { slug: 'cavalos-adai-origem-genetica' }))
    assert(html.includes('<a href="https://doi.org/10.3390/genes17101292">estudo publicado na revista <em>Genes</em>, em 2026</a>'))
    assert(html.includes('<a href="https://doi.org/10.3390/genes17101292">https://doi.org/10.3390/genes17101292</a>'))
    assert(html.includes('<a href="https://www.mgenetica.com/blog/marcas-brancas-cavalos-genetica/">Marcas brancas nos cavalos: o que a genética revela sobre sua origem?</a>'))
    assert(!html.includes('](https://'))
    assert(!/<a\b[^>]*>(?:(?!<\/a>).)*<a\b/s.test(html))
  } finally {
    await server.close()
  }
})
