#!/usr/bin/env python3
"""Compile edited translation dictionaries into curriculum overlays and offline labs."""
import hashlib, html, json, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
PLAN=ROOT/'frontend/lab-i18n/source-plan.json'
CACHE=ROOT/'frontend/lab-i18n/translations.json'
def key(text):return 's_'+hashlib.sha256(text.encode()).hexdigest()[:14]
def dump(value):return json.dumps(value,ensure_ascii=False).replace('<','\\u003c')
BONUS={
 'um':{'en':'one','es':'un'},
 'Boa':{'en':'Good','es':'Buena'},'Seca':{'en':'Dry','es':'Seca'},
 'aprovado':{'en':'approved','es':'aprobado'},'aprovado com ressalva':{'en':'approved with reservations','es':'aprobado con reservas'},
 'aprovado c/ ressalva':{'en':'approved with reservations','es':'aprobado con reservas'},
 'reprovado':{'en':'failed','es':'reprobado'},'alerta':{'en':'warning','es':'alerta'},
 'Nenhum.':{'en':'None.','es':'Ninguno.'}
}

def build():
 plan=json.loads(PLAN.read_text());cache=json.loads(CACHE.read_text())
 overrides=json.loads((ROOT/'frontend/lab-i18n/overrides.json').read_text())
 for text,values in overrides.items():
  for locale,value in values.items():cache[locale][text]=value
 def translate(value,locale):
  if isinstance(value,str):return cache[locale][value] if value.strip() else value
  if isinstance(value,list):return [translate(v,locale) for v in value]
  if isinstance(value,dict):return {k:translate(v,locale) for k,v in value.items()}
  return value
 curriculum=json.loads((ROOT/'frontend/src/data/legacy-curriculum.generated.json').read_text())
 for locale in ['en','es']:
  result={m['id']:{field:translate(m.get(field,''),locale) for field in plan['fields']} for m in curriculum['modules']}
  for row in result.values():
   row['prerequisites']=BONUS.get(row['prerequisites'],{}).get(locale,row['prerequisites'])
  (ROOT/f'frontend/src/data/courseTranslations/{locale}.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
 report=[]
 for file,row in plan['labs'].items():
  path=ROOT/'frontend/public/labs'/file
  source=path.read_text()
  if '<!-- MG-TRANSLATIONS:start -->' in source:
   # Build from immutable original Git blob. Refuse if source identity differs.
   import subprocess
   source=subprocess.check_output(['git','show',f'7ae53fbe1b0af7982b792fa7733097fce633b3d4:frontend/public/labs/{file}'],cwd=ROOT,text=True)
  if hashlib.sha256(source.encode()).hexdigest()!=row['sha256']:raise ValueError(f'{file}: original source changed; reinventory before rebuilding')
  dictionaries={locale:{} for locale in ['pt-BR','en','es']}
  def add(text):
   k=key(text);dictionaries['pt-BR'][k]=text
   for locale in ['en','es']:dictionaries[locale][k]=BONUS.get(text,{}).get(locale,cache[locale].get(text,text))
   return k
  edits=[]
  for e in row['edits']:
   k=add(e['text']);kind=e['kind']
   if kind=='html':replacement=e['prefix']+f'<span data-i18n="{k}">'+html.escape(e['text'])+'</span>'+e['suffix']
   elif kind=='js':
    replacement=f'window.MGi18n.t({json.dumps(k)})'
    if 'expressions' in e:replacement=f'window.MGi18n.format({json.dumps(k)}, [{", ".join(e["expressions"])}])'
    # Text inside dynamically constructed HTML is also bound for later language switches.
    if '<' in e['text']:
     plain=html.unescape(re.sub(r'<[^>]*>','',e['text'])).strip()
     if plain and re.search(r'[A-Za-zÀ-ÿ]{2}',plain):
      pk=key(plain);dictionaries['pt-BR'][pk]=plain
      for locale in ['en','es']:dictionaries[locale][pk]=html.unescape(re.sub(r'<[^>]*>','',cache[locale][e['text']])).strip()
   elif kind=='attribute':
    attr='data-i18n-aria' if source[e['start']-12:e['start']].endswith('aria-label="') else 'data-i18n-title'
    replacement=html.escape(e['text'],quote=True)+f'" {attr}="{k}'
   else:continue
   edits.append((e['start'],e['end'],replacement))
  for text in BONUS:add(text)
  for start,end,replacement in sorted(edits,reverse=True):source=source[:start]+replacement+source[end:]
  title=re.search(r'<title>([^<]+)</title>',source).group(1); title_key=add(html.unescape(title))
  dictionaries_script='<!-- MG-TRANSLATIONS:start -->\n<script type="application/json" id="i18n">'+dump(dictionaries)+'</script>\n<!-- MG-TRANSLATIONS:end -->\n'
  source=source.replace('<!-- MG-RUNTIME:start',dictionaries_script+'<!-- MG-RUNTIME:start',1)
  source=source.replace('</head>', '''<style id="mg-i18n-layout">
  .page, .card, .res, .res-grid > *, .twores > * { min-width: 0; }
  [data-i18n] { overflow-wrap: anywhere; }
  @media (max-width: 420px) {
    .res-grid, .twores { grid-template-columns: 1fr; }
  }
  </style>\n</head>''')
  source=source.replace('window.MGi18n = { t: t, lang: function () { return LANG; } };', '''window.MGi18n = {
    t: t,
    format: function (key, values) { return t(key).replace(/\\{(\\d+)\\}/g, function (_, i) { return values[Number(i)]; }); },
    lang: function () { return LANG; }
  };
  loadDict();
  var initialLang = params().get("lang");
  if (DICT[initialLang]) LANG = initialLang;''')
  source=source.replace('if (d.type === "mg-set-lang") setLang(d.lang);','if (d.type === "mg-set-lang" && ev.source === parent) setLang(d.lang);')
  source=source.replace('root.setAttribute("lang", LANG);','root.setAttribute("lang", LANG);\n    document.title = t('+json.dumps(title_key)+');')
  source=source.replace('window.dispatchEvent(new CustomEvent("mg:langchange",', '''document.querySelectorAll("[data-i18n-title]").forEach(function(n) { n.title = t(n.getAttribute("data-i18n-title")); });
    window.dispatchEvent(new CustomEvent("mg:langchange",''')
  # Repaint simulation outputs with unchanged controls; M05 caches the random trajectory.
  if file.startswith('M05_'):
   source=source.replace('function update(){','let languageOnly = false, lastDrift = null;\n  function update(){',1)
   source=source.replace('const dft=drift?trajDrift():null;','const dft=drift?(languageOnly && lastDrift ? lastDrift : trajDrift()):null; lastDrift=dft;')
   refresh='languageOnly=true; try { update(); } finally { languageOnly=false; }'
  elif file.startswith('M18_'):refresh='computeStats();'
  elif file.startswith('M20_'):
   source=source.replace('function describe(i,j){','let lastHeatCell = null;\n  function describe(i,j){',1)
   source=source.replace("()=>{el('hmInfo').innerHTML=describe(i,j);}","()=>{lastHeatCell=[i,j];el('hmInfo').innerHTML=describe(i,j);}")
   refresh="redrawAll(); if (lastHeatCell) el('hmInfo').innerHTML=describe(...lastHeatCell);"
  else:refresh='update();'
  if file.startswith('M07_'):
   source=source.replace('window.MGi18n.t('+json.dumps(key(' loco'))+")+(L>1?'s':'')", "(window.MGi18n.lang()==='en' ? (L===1?' locus':' loci') : window.MGi18n.t("+json.dumps(key(' loco'))+")+(L>1?'s':''))")
  # Dynamic controls created once retain bindings via matching dictionary text.
  refresh_script='''
<script id="mg-language-refresh">
(() => {
  const dict = JSON.parse(document.getElementById('i18n').textContent);
  const aliases = new Map();
  for (const entries of Object.values(dict)) for (const [key, text] of Object.entries(entries)) {
    if (!text.includes('<') && text.trim()) aliases.set(text.trim(), key);
  }
  const bindings = new WeakMap();
  function bindAndTranslate() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement.closest('script,style,pre,code,[data-i18n]')) continue;
      const key = bindings.get(node) || aliases.get(node.textContent.trim());
      if (!key) continue;
      bindings.set(node, key);
      const lead = node.textContent.match(/^\\s*/)[0], tail = node.textContent.match(/\\s*$/)[0];
      node.textContent = lead + window.MGi18n.t(key) + tail;
    }
  }
  window.addEventListener('mg:langchange', () => { REFRESH bindAndTranslate(); });
  bindAndTranslate();
})();
</script>
'''.replace('REFRESH',refresh)
  # Display farm/QC words without changing data or classification decisions.
  if file.startswith('M16_'):source=source.replace("+a.farm+'<br>'", "+window.MGi18n.t(a.farm==='Boa'?'"+key('Boa')+"':'"+key('Seca')+"')+'<br>'")
  if file.startswith('M21_'):source=source.replace("+a.qcLab+'</span>", "+window.MGi18n.t(({ 'aprovado':'"+key('aprovado')+"', 'aprovado c/ ressalva':'"+key('aprovado c/ ressalva')+"', 'reprovado':'"+key('reprovado')+"' })[a.qcLab] || a.qcLab)+'</span>")
  path.write_text(source.replace('</body>',refresh_script+'</body>'))
  report.append({'file':file,'keys':len(dictionaries['pt-BR']),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
 (ROOT/'frontend/lab-i18n/build-manifest.json').write_text(json.dumps({'modules':21,'labs':report},indent=2)+'\n')
 print(json.dumps({'modules':21,'languages':['en','es'],'labs':len(report),'labKeys':sum(r['keys'] for r in report)}))
if __name__=='__main__':build()
