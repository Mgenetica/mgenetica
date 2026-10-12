#!/usr/bin/env python3
"""Repair lab translations without exposing HTML, math or control attributes to MT."""
import argparse,html,json,re
from pathlib import Path
from translate_local import Model,protect,restore
from review_translations import prose_fix
ROOT=Path(__file__).resolve().parents[2]
TAGS=re.compile(r'(<[A-Za-z/][^>]*(?:>|$)|\n)')
def math_symbols(t):return sorted(re.findall(r'[≥≤≈≠><→←±×÷]',re.sub(r'`[^`]*`|<[A-Za-z/][^>]*(?:>|$)','',html.unescape(t))))
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--pt-en',required=True);ap.add_argument('--en-es',required=True);args=ap.parse_args()
 en=Path(args.pt_en);es=Path(args.en_es)
 models={'en':Model(en,en/'source.spm',en/'target.spm'),'es':Model(es,es/'sentencepiece.model')}
 path=ROOT/'frontend/lab-i18n/translations.json';cache=json.loads(path.read_text());plan=json.loads((ROOT/'frontend/lab-i18n/source-plan.json').read_text());overrides=json.loads((ROOT/'frontend/lab-i18n/overrides.json').read_text())
 keys=set(e['text'] for row in plan['labs'].values() for e in row['edits'] if e['kind']=='js' and '<' in e['text'])
 for source in plan['texts']:
  if any(math_symbols(source)!=math_symbols(cache[lang][source]) for lang in models):keys.add(source)
  if any(re.search(r'[{}]',re.sub(r'`[^`]*`|\{\d+\}','',cache[lang][source])) and not re.search(r'[{}]',re.sub(r'`[^`]*`|\{\d+\}','',source)) for lang in models):keys.add(source)
 segments=sorted(set(part for source in keys for part in TAGS.split(source)[::2] if part.strip()))
 result={lang:{} for lang in models}
 def one(part,lang):
  trim=part.strip();pre=part[:len(part)-len(part.lstrip())];post=part[len(part.rstrip()):]
  entry=overrides.get(trim) or overrides.get(trim.lower())
  if entry:
   value=entry[lang]
   if trim[:1].isupper():value=value[:1].upper()+value[1:]
   return pre+value+post
  source=trim if lang=='en' else result['en'][part].strip()
  protected,pieces=protect(source)
  if not re.search(r'[A-Za-zÀ-ÿ]{2}',re.sub(r'\{\d+\}','',protected)):return pre+source+post
  value=restore(models[lang].batch([protected])[0],pieces)
  if value is None:
   fragments=re.split(r'(`[^`]*`|\{\d+\}|[≥≤≈≠><→←±×÷]|\b\d+(?:[.,:]\d+)*(?:%|ª|º)?)',source)
   for i in range(0,len(fragments),2):
    piece=fragments[i];word=piece.strip()
    if not word:continue
    entry=overrides.get(word) or overrides.get(word.lower())
    if entry:value_part=entry[lang]
    elif word in {'e','é','da','do','em','ou'} and lang=='en':value_part={'e':'and','é':'is','da':'from the','do':'of the','em':'in','ou':'or'}[word]
    elif word in {'and','is','of','in','or'} and lang=='es':value_part={'and':'y','is':'es','of':'de','in':'en','or':'o'}[word]
    elif re.search(r'[A-Za-zÀ-ÿ]{2}',word):value_part=models[lang].batch([word])[0]
    else:continue
    fragments[i]=piece[:len(piece)-len(piece.lstrip())]+value_part.strip()+piece[len(piece.rstrip()):]
   value=''.join(fragments)
  return pre+prose_fix(value,lang)+post
 for lang in models:
  for i,part in enumerate(segments):
   result[lang][part]=one(part,lang)
   if i%40==0:print(json.dumps({'lang':lang,'segments':i,'total':len(segments)}),flush=True)
  for source in keys:
   parts=TAGS.split(source)
   for i in range(0,len(parts),2):
    if parts[i].strip():parts[i]=result[lang][parts[i]]
   cache[lang][source]=''.join(parts)
 path.write_text(json.dumps(cache,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'repairedTexts':len(keys)}))
if __name__=='__main__':main()
