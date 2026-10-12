#!/usr/bin/env python3
"""Inventory public curriculum and lab prose; keep originals and scientific code."""
import hashlib, html, json, re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
FIELDS = ('title objective blockSummary feynmanQuestion intro coreExplanation formula technicalNote analogy animalExample workedExample visualExplanation manualCalculation labObjective labObserve biologicalInterpretation checkpoint task completionEvidence prerequisites estimatedTime topics glossaryTerms reviewQuiz quizFocus').split()
modules = json.loads((ROOT/'frontend/src/data/legacy-curriculum.generated.json').read_text())['modules']
selected = json.load(open('/tmp/mgenetica-lab-js-strings.json'))
single = {'de','e','loco','unidades','Macho','Fêmea','informativo','manter','remover','Repetibilidade','acurácia','limiar','média','geração'}
def prose(row):
    text = row['text']; clean = html.unescape(re.sub(r'<[^>]*>', '', text)).strip()
    if row.get('key') or re.search(r'rgba?\(|monospace|sans-serif|#[0-9a-fA-F]{3,8}|flex:|background:|grid-template|^\.[\w-]+|^\s*pcell ', text): return False
    return bool(re.search(r'[A-Za-zÀ-ÿ]{2,}\s+[A-Za-zÀ-ÿ]{2,}', clean) or re.search(r'[áéíóúãõâêôçÁÉÍÓÚÃÕÂÊÔÇ]',clean) or clean in single)
texts = set()
def collect(value):
    if isinstance(value,str):
        if value.strip(): texts.add(value)
    elif isinstance(value,list):
        for v in value: collect(v)
    elif isinstance(value,dict):
        for v in value.values(): collect(v)
for module in modules:
    for field in FIELDS: collect(module.get(field,''))
labs = {}
for path in sorted((ROOT/'frontend/public/labs').glob('M*.html')):
    source = path.read_text(); edits=[]
    if '<!-- MG-TRANSLATIONS:start -->' in source:
        raise ValueError(f'{path.name}: already compiled; inventory immutable originals, not translated output')
    # Text nodes in body only: retain markup, control IDs, values and event wiring.
    body_start=source.index('<body>')+6
    for match in re.finditer(r'<script\b[^>]*>[\s\S]*?</script>|<[^>]+>|([^<]+)',source[body_start:]):
        if match.group(1) is None: continue
        raw=match.group(1); text=html.unescape(raw.strip())
        if not re.search(r'[A-Za-zÀ-ÿ]{2,}',text) or re.fullmatch(r'[\s\d\W]*(?:AA|Aa|aa|AB|BB|SNP|EBV|DEP|BLUP|GWAS|QC|MAF|HWE|MGenética|kg|cm|R)[\s\d\W]*',text): continue
        # Mathematical labels without explanatory words are language neutral.
        if not re.search(r'[A-Za-zÀ-ÿ]{3,}|\b(?:Pai|Mãe|de|em)\b',text): continue
        edits.append({'start':body_start+match.start(1),'end':body_start+match.end(1),'text':text,'kind':'html','prefix':raw[:len(raw)-len(raw.lstrip())],'suffix':raw[len(raw.rstrip()):]})
        texts.add(text)
    for row in selected:
        if row['file']==path.name and prose(row):
            edits.append(dict(row,kind='js'));texts.add(row['text'])
    # Include title and accessible control descriptions.
    for match in re.finditer(r'<title>([^<]+)</title>|(?:aria-label|title)="([^"]+)"',source):
        text=html.unescape(match.group(1) or match.group(2)); texts.add(text)
        edits.append({'kind':'title' if match.group(1) else 'attribute','text':text,'start':match.start(1 if match.group(1) else 2),'end':match.end(1 if match.group(1) else 2)})
    data=re.search(r'<script type="application/json" id="dados">([\s\S]*?)</script>',source).group(1)
    labs[path.name]={'sha256':hashlib.sha256(source.encode()).hexdigest(),'dataSha256':hashlib.sha256(data.encode()).hexdigest(),'edits':edits}
plan={'fields':FIELDS,'texts':sorted(texts),'labs':labs}
p=ROOT/'frontend/lab-i18n/source-plan.json';p.write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'modules':len(modules),'labs':len(labs),'uniqueTexts':len(texts),'labEdits':sum(len(r['edits']) for r in labs.values())}))
