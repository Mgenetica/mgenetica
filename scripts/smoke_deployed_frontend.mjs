#!/usr/bin/env node

const inputUrl = process.argv[2] || process.env.DEPLOYED_URL || 'https://mgenetica.github.io/mgenetica/'
const baseUrl = new URL(inputUrl.endsWith('/') ? inputUrl : `${inputUrl}/`)

const requiredStaticPaths = [
  'course-assets/manifest.json',
  'course-assets/module-03/calculator.html',
  'course-assets/module-15/dep-ebv-ranking.html',
  'course-assets/module-21/pipeline-selecao.svg'
]

async function fetchText(url) {
  const response = await fetch(url, { redirect: 'follow' })
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`)
  }
  return response.text()
}

async function assertOk(url) {
  const response = await fetch(url, { method: 'HEAD', redirect: 'follow' })
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`)
  }
  return response
}

function uniqueMatches(html, regex) {
  return [...new Set([...html.matchAll(regex)].map((match) => match[1]))]
}

function resolveAsset(path) {
  return new URL(path, baseUrl).toString()
}

const html = await fetchText(baseUrl.toString())

if (!/<div id="root">/.test(html)) {
  throw new Error('Published HTML does not contain the React root element.')
}

if (html.includes('quarto-') || html.includes('quarto-nav')) {
  throw new Error('Published HTML still appears to be the legacy Quarto page.')
}

const scripts = uniqueMatches(html, /<script[^>]+src="([^"]+\.js)"/g)
const stylesheets = uniqueMatches(html, /<link[^>]+href="([^"]+\.css)"/g)

if (scripts.length === 0) {
  throw new Error('Published HTML does not reference a Vite JavaScript bundle.')
}

if (stylesheets.length === 0) {
  throw new Error('Published HTML does not reference a Vite stylesheet.')
}

for (const asset of [...scripts, ...stylesheets]) {
  await assertOk(resolveAsset(asset))
}

for (const path of requiredStaticPaths) {
  await assertOk(resolveAsset(path))
}

console.log(`Smoke OK: ${baseUrl.toString()}`)
console.log(`Checked bundles: ${scripts.length} script(s), ${stylesheets.length} stylesheet(s)`)
console.log(`Checked course assets: ${requiredStaticPaths.length}`)
