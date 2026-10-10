#!/usr/bin/env node

const inputUrl = process.argv[2] || process.env.DEPLOYED_URL || 'https://mgenetica.github.io/mgenetica/'
const baseUrl = new URL(inputUrl.endsWith('/') ? inputUrl : `${inputUrl}/`)

const expectedRedirects = [
  { path: 'plataforma.html', hash: '#catalog' },
  { path: 'modules/', hash: '#catalog' },
  { path: 'modules/modulo01-revisao-de-genetica-basica.html', hash: '#course/module-01' },
  { path: 'modules/modulo15-avaliacao-genetica-dep-ebv-e-ranking-de-animais.html', hash: '#course/module-15' },
  { path: 'modules/modulo21-projeto-final-pipeline-completo-de-selecao.html', hash: '#course/module-21' }
]

async function fetchText(url) {
  const response = await fetch(url, { redirect: 'manual' })
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`)
  }
  return response.text()
}

function assertIncludes(source, expected, label) {
  if (!source.includes(expected)) {
    throw new Error(`${label} does not include ${expected}`)
  }
}

const rootHtml = await fetchText(baseUrl.toString())
assertIncludes(rootHtml, '<div id="root"></div>', 'root HTML')
assertIncludes(rootHtml, 'type="module"', 'root HTML')

const notFoundHtml = await fetchText(new URL('404.html', baseUrl).toString())
assertIncludes(notFoundHtml, "window.location.replace(base + (hash ? '#' + hash : ''))", '404 fallback')

for (const route of expectedRedirects) {
  const url = new URL(route.path, baseUrl)
  const html = await fetchText(url.toString())
  assertIncludes(html, route.hash, route.path)
  assertIncludes(html, 'window.location.replace', route.path)
}

console.log(`Route smoke OK: ${baseUrl.toString()}`)
console.log(`Checked redirect routes: ${expectedRedirects.length}`)
