#!/usr/bin/env python3
"""Apply terminology review and preserve Markdown list structure outside code."""
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
REPLACEMENTS={
 'en':{
  'Repetitability':'Repeatability','repetitability':'repeatability','Repetibility':'Repeatability','repetibility':'repeatability',
  'Herdability':'Heritability','herdability':'heritability','heredability':'heritability',
  'Genotypical':'Genotypic','genotypical':'genotypic','acuracy':'accuracy','Acuracy':'Accuracy',
  'heterose':'heterosis','Heterose':'Heterosis','epistasia':'epistasis','Epistasia':'Epistasis',
  'Endogamy':'Inbreeding','endogamy':'inbreeding','endogamous':'inbred','non-inbreeding':'non-inbred',
  'Copyes':'Copies','copyes':'copies','children':'offspring','Children':'Offspring',
  'horse team':'horse herd','horse planter':'horse herd',
  ' é ':' is ',' e ':' and ',
 },
 'es':{'Heribilidad':'Heredabilidad','heribilidad':'heredabilidad','Herdabilidad':'Heredabilidad','herdabilidad':'heredabilidad','Heritabilidad':'Heredabilidad','heritabilidad':'heredabilidad','Heritability':'Heredabilidad','heritability':'heredabilidad','repetitabilidad':'repetibilidad','endogamía':'endogamia','heterose':'heterosis','epistasia':'epistasis','Copyes':'Copias','copyes':'copias','niños':'descendientes','Niños':'Descendientes','Matrix':'Matriz',' abrigo':' pelaje','"samo letra"':'"misma letra"',' é ':' es '}
}
def prose_fix(text,locale):
 parts=re.split(r'(`[^`]*`|<[^>]*>|\{\d+\})',text)
 for i in range(0,len(parts),2):
  for before,after in REPLACEMENTS[locale].items():parts[i]=parts[i].replace(before,after)
 return ''.join(parts)
def markdown_structure(source,target):
 before=source.split('\n');after=target.split('\n')
 if len(before)!=len(after):raise ValueError('Markdown line count changed')
 for i,line in enumerate(before):
  prefix=re.match(r'^(\s*(?:[-*•]|\d+[.)])\s+)',line)
  if prefix:
   after[i]=prefix.group()+re.sub(r'^\s*(?:[-*•–—]|\d+[.)])?\s*','',after[i])
 return '\n'.join(after)
def main():
 path=ROOT/'frontend/lab-i18n/translations.json';cache=json.loads(path.read_text());changes={}
 overrides=json.loads((ROOT/'frontend/lab-i18n/overrides.json').read_text())
 for source,values in overrides.items():
  if source in cache['en']:
   for locale,value in values.items():cache[locale][source]=value
 for locale,entries in cache.items():
  count=0
  for source,target in entries.items():
   revised=markdown_structure(source,prose_fix(target,locale))
   if locale=='es':
    if re.search(r'garanh',source,re.I): revised=re.sub(r'\bpuestos\b','sementales',revised)
    if 'SNP' in source: revised=re.sub(r'\bPNB\b','SNPs',revised)
    revised=re.sub(r'\b(?:folas|foles|foales)\b','potros',revised,flags=re.I)
    revised=re.sub(r'\b(?:pollito|pollitos)\b','cría',revised)
    if 'cria' in source.lower():revised=re.sub(r'\bchicas\b','crías',revised)
    revised=re.sub(r'\bstallion\b','semental',revised,flags=re.I)
    revised=re.sub(r'\bherdabilidad\b','heredabilidad',revised,flags=re.I)
   if locale=='en':
    revised=revised.replace("Punnett's painting","Punnett square").replace("Punnett's picture","Punnett square")
   # A pipe inside R code is not a Markdown table separator. Restore every
   # immutable inline code span, including pipe expressions, from the source.
   original_code=re.findall(r'`[^`]*`',source)
   translated_code=re.findall(r'`[^`]*`',revised)
   if len(original_code)!=len(translated_code):raise ValueError('Inline code count changed')
   original_iter=iter(original_code)
   revised=re.sub(r'`[^`]*`',lambda _:next(original_iter),revised)
   if revised!=target:count+=1
   entries[source]=revised
  changes[locale]=count
 # Source-specific corrections from review. Keep algebra and example values unchanged.
 modules=json.loads((ROOT/'frontend/src/data/legacy-curriculum.generated.json').read_text())['modules']
 m13=next(m for m in modules if m['id']=='module-13')
 text=m13['intro'];cache['en'][text]=cache['en'][text].replace('Parenting between two animals','Relatedness between two animals').replace('father and son and primes','parent and offspring, and cousins')
 path.write_text(json.dumps(cache,ensure_ascii=False,indent=2)+'\n')
 (ROOT/'frontend/lab-i18n/review-manifest.json').write_text(json.dumps({'terminologyCorrections':changes,'preserved':'inline code, data, Markdown lists','reviewScope':'terminology and structural checks; editorial review still recommended before publication'},indent=2)+'\n')
 print(json.dumps(changes))
if __name__=='__main__':main()
