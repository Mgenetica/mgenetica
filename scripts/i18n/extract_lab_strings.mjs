// One-time AST inventory: do not replace identifiers, selectors, events or formulas.
import fs from 'node:fs'
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
const require = createRequire(import.meta.url)
const { parse } = require(process.env.ACORN_PATH || 'acorn')
const rows = []
for (const file of fs.readdirSync('frontend/public/labs').filter(n => /^M.*\.html$/.test(n))) {
  const ref = process.argv.find(arg => arg.startsWith('--ref='))?.slice(6)
  const html = ref ? execFileSync('git', ['show', `${ref}:frontend/public/labs/${file}`], { encoding:'utf8' }) : fs.readFileSync(`frontend/public/labs/${file}`, 'utf8')
  const edits = []
  for (const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (match[1].trim()) continue
    const code = match[2], offset = match.index + match[0].indexOf('>') + 1
    const ast = parse(code, { ecmaVersion: 'latest' })
    function walk(node, parent) {
      if (!node || typeof node !== 'object') return
      if (node.type === 'Literal' && typeof node.value === 'string') {
        rows.push({ file, start: offset + node.start, end: offset + node.end, text: node.value, parent: parent?.type, key: parent?.key === node, context: code.slice(Math.max(0,node.start-50),node.end+25) })
      }
      if (node.type === 'TemplateLiteral') {
        rows.push({ file, start: offset + node.start, end: offset + node.end, text: node.quasis.map((q,i) => q.value.cooked + (i < node.expressions.length ? `{${i}}` : '')).join(''), expressions: node.expressions.map(e => code.slice(e.start,e.end)), parent: parent?.type, context: code.slice(Math.max(0,node.start-50),node.end+25) })
        return
      }
      for (const [key,value] of Object.entries(node)) {
        if (['start','end','type'].includes(key)) continue
        if (Array.isArray(value)) value.forEach(v => walk(v,node)); else if (value && typeof value === 'object') walk(value,node)
      }
    }
    walk(ast)
  }
}
fs.writeFileSync('/tmp/mgenetica-lab-js-strings.json', JSON.stringify(rows,null,2)+'\n')
console.log(JSON.stringify({ strings: rows.length, files: new Set(rows.map(r => r.file)).size }))
