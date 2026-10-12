#!/usr/bin/env python3
"""Generate editable EN/ES dictionaries offline using supplied CTranslate2 models.
No model, translation service or Python dependency is needed by the website.
"""
import argparse, hashlib, json, re, time
from pathlib import Path
import ctranslate2
import sentencepiece
ROOT=Path(__file__).resolve().parents[2]
PROTECT=re.compile(r'`[^`]*`|<[A-Za-z/][^>]*(?:>|$)|&(?:\w+|#\d+);|\{\d+\}|\b\d+(?:[.,:]\d+)*(?:%|ª|º)?|\b(?:AA|Aa|aa|AB|BB|SNP\d*|EBV|DEP|BLUP|GWAS|QC|MAF|HWE|MGenética|Hardy-Weinberg)\b|[hHrR][²₂]|[pq][²₂]|[χσ][²₂]?|[≥≤≈≠><→←±×÷]')
EN_FIX={'herdability':'heritability','Herdability':'Heritability','hereditability':'heritability','Heredability':'Heritability','inbreeding':'inbreeding','heritability':'heritability'}
ES_FIX={'heribilidad':'heredabilidad','Heribilidad':'Heredabilidad','heredabilidad':'heredabilidad','repetibilidad':'repetibilidad','endogamía':'endogamia'}
def fix(text,locale):
    for wrong,right in (EN_FIX if locale=='en' else ES_FIX).items(): text=text.replace(wrong,right)
    return text
class Model:
    def __init__(self,path,sp,target=None):
        self.sp=sentencepiece.SentencePieceProcessor(model_file=str(sp))
        self.target=sentencepiece.SentencePieceProcessor(model_file=str(target or sp))
        self.tr=ctranslate2.Translator(str(path),device='cpu',compute_type='int8',inter_threads=1,intra_threads=4)
    def batch(self,texts):
        parts=[re.split(r'(?<=[.!?])\s+(?=[A-ZÀ-Ý])',text) for text in texts]
        sentences=[sentence for group in parts for sentence in group]
        result=self.tr.translate_batch([self.sp.encode(s,out_type=str) for s in sentences],beam_size=4,length_penalty=0.6,replace_unknowns=True,no_repeat_ngram_size=3,max_decoding_length=1024)
        decoded=iter(self.target.decode(r.hypotheses[0]) for r in result)
        return [' '.join(next(decoded) for _ in group) for group in parts]
def protect(text):
    pieces=[]
    def replace(m):
        pieces.append(m.group());return '{'+str(len(pieces)-1)+'}'
    return PROTECT.sub(replace,text),pieces

def restore(text,pieces):
    for i,p in enumerate(pieces):
        marker='{'+str(i)+'}'
        text=re.sub(r'\{\s*'+str(i)+r'\s*\}',lambda _:marker,text)
        # Any lost or duplicated scientific token is an error, never silently accepted.
        if text.count(marker)!=1: return None
        text=text.replace(marker,p)
    return text

def chunks(text):
    # Preserve markdown layout; translation applies only inside lines/cells.
    parts=[];start=0
    for match in re.finditer(r'`[^`]*`|\n|\|',text):
        if match.group().startswith('`'):continue
        parts.extend([text[start:match.start()],match.group()]);start=match.end()
    parts.append(text[start:]);return parts

def run():
    ap=argparse.ArgumentParser();ap.add_argument('--pt-en',required=True);ap.add_argument('--en-es',required=True);args=ap.parse_args()
    pten=Path(args.pt_en);enes=Path(args.en_es)
    models={'en':Model(pten,pten/'source.spm',pten/'target.spm'),'es':Model(enes,enes/'sentencepiece.model')}
    plan=json.loads((ROOT/'frontend/lab-i18n/source-plan.json').read_text())
    cachepath=ROOT/'frontend/lab-i18n/translations.json'
    cache=json.loads(cachepath.read_text()) if cachepath.exists() else {'en':{},'es':{}}
    segments=sorted(set(s.strip() for text in plan['texts'] for s in chunks(text) if re.search(r'[A-Za-zÀ-ÿ]{2,}',s)))
    # Smaller sentences avoid truncation of long explanations. Protected math stays intact.
    units={s:re.split(r'(?<=[.!?])\s+(?=[A-ZÀ-Ý])',s) for s in segments}
    unique=sorted(set(u for ss in units.values() for u in ss))
    unit_cache={lang:{} for lang in models}
    overrides=json.loads((ROOT/'frontend/lab-i18n/overrides.json').read_text())
    progress=ROOT/'frontend/lab-i18n/generation.jsonl'
    for locale,model in models.items():
        # Cache full original texts and derive missing segments on reruns.
        pending=[]
        for unit in unique:
            if unit in overrides:
                unit_cache[locale][unit]=overrides[unit][locale];continue
            protected,pieces=protect(unit)
            if not re.search(r'[A-Za-zÀ-ÿ]{2,}',re.sub(r'\{\d+\}','',protected)):
                unit_cache[locale][unit]=unit;continue
            pending.append((unit,protected,pieces))
        for start in range(0,len(pending),24):
            batch=pending[start:start+24]
            src=[r[1] for r in batch] if locale=='en' else [protect(unit_cache['en'][r[0]])[0] for r in batch]
            results=model.batch(src)
            for (unit,protected,pieces),translated in zip(batch,results):
                if locale=='es': _,pieces=protect(unit_cache['en'][unit])
                value=restore(translated,pieces)
                if value is None:
                    # Translate only prose between immutable math/code/markup fragments.
                    original=unit if locale=='en' else unit_cache['en'][unit]
                    parts=PROTECT.split(original);matches=PROTECT.findall(original)
                    sentences=[part for part in parts if re.search(r'[A-Za-zÀ-ÿ]{2,}',part)]
                    translated_parts=iter(model.batch(sentences))
                    rebuilt=[]
                    for i,part in enumerate(parts):
                        if re.search(r'[A-Za-zÀ-ÿ]{2,}',part):
                            leading=part[:len(part)-len(part.lstrip())];trailing=part[len(part.rstrip()):]
                            rebuilt.append(leading+next(translated_parts).strip()+trailing)
                        else:rebuilt.append(part)
                        if i<len(matches):rebuilt.append(matches[i])
                    value=''.join(rebuilt)
                unit_cache[locale][unit]=fix(value,locale)
            if start%240==0:
                print(json.dumps({'locale':locale,'translatedUnits':start+len(batch),'total':len(pending)}),flush=True)
                with progress.open('a') as f:f.write(json.dumps({'locale':locale,'units':start+len(batch),'time':time.time()})+'\n')
        for text in plan['texts']:
            values=[]
            for segment in chunks(text):
                trim=segment.strip()
                if trim in units:
                    value=' '.join(unit_cache[locale][u] for u in units[trim])
                    segment=segment[:len(segment)-len(segment.lstrip())]+value+segment[len(segment.rstrip()):]
                values.append(segment)
            cache[locale][text]=''.join(values)
        cachepath.write_text(json.dumps(cache,ensure_ascii=False,indent=2)+'\n')
    report={'generator':'offline CTranslate2 / SciLake PT-EN and OPUS EN-ES models','languages':['en','es'],'texts':len(plan['texts']),'protectedPattern':PROTECT.pattern,'sourcePlanSha256':hashlib.sha256((ROOT/'frontend/lab-i18n/source-plan.json').read_bytes()).hexdigest(),'models':{lang:hashlib.sha256((Path(args.pt_en)/'model.bin' if lang=='en' else Path(args.en_es)/'model.bin').read_bytes()).hexdigest() for lang in models}}
    (ROOT/'frontend/lab-i18n/generation-manifest.json').write_text(json.dumps(report,indent=2)+'\n')
if __name__=='__main__':run()
