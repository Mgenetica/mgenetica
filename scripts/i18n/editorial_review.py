#!/usr/bin/env python3
"""Apply traceable editorial corrections without changing protected scientific tokens."""
import hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
P=ROOT/'frontend/lab-i18n'
def protected(text):
 return re.split(r'(`[^`]*`|<[^>]*>|\{\d+\})',text)
def revise(text,rules):
 parts=protected(text)
 for i in range(0,len(parts),2):
  for old,new in rules:parts[i]=re.sub(r'(?<!\w)'+re.escape(old)+r'(?!\w)',new,parts[i],flags=re.I)
 return ''.join(parts)
def main():
 cache=json.loads((P/'translations.json').read_text()); overrides=json.loads((P/'overrides.json').read_text())
 expected=(P/'editorial-source-plan.sha256').read_text().strip()
 if hashlib.sha256((P/'source-plan.json').read_bytes()).hexdigest()!=expected:raise ValueError('Source plan changed; reconcile editorial passage identifiers before rebuilding')
 changes=[]
 manual=json.loads((P/'editorial-corrections.json').read_text()) if (P/'editorial-corrections.json').exists() else {}
 texts=json.loads((P/'source-plan.json').read_text())['texts']
 curated={texts[int(i)]:values for i,values in manual.items()}
 rules={
 'en':[
 ('communicable merit','transmissible genetic merit'), ('shrinked','shrunk'), ('height at the heartwood','height at the withers'), ('height at the heart of horses','height at the withers in horses'), ('genetic derivative','genetic drift'), ('Derivatives change','Drift changes'), ('Derivative can','Drift can'), ('mean point','midpoint'), ('gross ranking','raw ranking'), ('gross performance','raw performance'), ('gross observation','raw observation'),('genetic improvement','genetic improvement'),
 ('complete siblings','full siblings'),('complete brothers','full siblings'),('full brothers','full siblings'),
 ('cake ruler','miscalibrated ruler'),('cake rulers','miscalibrated rulers'),('genetic races','breeds'),('races','breeds'),('race','breed'),
 ('Residue','residual'),('residues','residuals'),('waste','residual'),('addiction','additivity'),('additiveness','additivity'),
 ('Threshold feature','Threshold trait'),('threshold characteristics','threshold traits'),('threshold characteristic','threshold trait'),
 ('trait of threshold','threshold trait'),('characteristics','traits'),('characteristic','trait'),
 ('inherited fraction','heritable fraction'),
 ('father-daughter','sire–daughter'),('bar code','barcode'),('Minor Allele Frequency','minor allele frequency'),
 ('genotypic proportion','genotype proportion'),('genotypic proportions','genotype proportions'),
 ('heterozygous was','heterozygote was'),('heterozygous is','heterozygote is'),('the heterozygous','the heterozygote'),
 ('the homozygous','the homozygote'),('another rare allele','the other allele is rare'),('biological prescription','biological recipe'),
 ('animal\'s prescription','animal\'s recipe'),('Recharge','Reload'),('Pico is','A peak is'),('1 loci','1 locus'),('eachaa','each aa'),('eachAa','each Aa'),
 ],
 'es':[
 ('tarifa de llamada','tasa de genotipado'), ('criadores','reproductores'), ('criador','reproductor'), ('engendramiento','endogamia'), ('lacus','locus'), ('cordura','sanidad'), ('homocigodos','homocigotos'), ('homocigotes','homocigotos'), ('heterocigonos','heterocigotos'), ('heterocigoos','heterocigotos'), ('heterocigous','heterocigotos'), ('homozygotes','homocigotos'), ('homozygous','homocigotos'), ('heterocigotas','heterocigotos'), ('homozigotes','homocigotos'), ('gametes','gametos'), ('gameta','gameto'), ('hemizigotes','hemicigotos'), ('genotipados','genotipos'), ('alelicas','alélicas'), ('alelica','alélica'), ('aleicas','alélicas'), ('aleica','alélica'), ('aleica','alélica'), ('alelo alelo','alelo'), ('aleleo','alelo'), ('aleles','alelos'), ('en la mejoramiento','en el mejoramiento'), ('la mejoramiento','el mejoramiento'), ('el derivado genético','la deriva genética'), ('los derivativos','la deriva'), ('el derivativo','la deriva'), ('selección de los','selección de los'), ('encogimiento','contracción'), ('encogida','con contracción'), ('encogedora','con contracción'), ('encogida','con contracción'), ('altura en la madera del corazón','altura a la cruz'), ('altura en el corazón de los caballos','altura a la cruz de los caballos'), ('medios sibs','medio hermanos'), ('medios hermanos','medio hermanos'), ('semi-hermanos no criados','medio hermanos no endogámicos'), ('vicio híbrido','vigor híbrido'), ('Mendelian','mendelianas'), ('tasa mínima de llamada','tasa mínima de genotipado'), ('relación de llamada','tasa de genotipado'), ('tasa de pérdida y llamada','proporción de datos faltantes y tasa de genotipado'), ('faltante SNPs','genotipos SNP faltantes'), ('Subtracting the means','Al restar las medias'), ('sostenibilidad','susceptibilidad'), ('apalancamiento aleatorio','apareamiento aleatorio'), ('el gestación','la gestación'), ('varianza gotas','varianza disminuye'), ('medios familiares','medias familiares'), ('altura en la leña','altura a la cruz'), ('heterocigosis','heterocigosidad'), ('no aditivo','no aditiva'), ('viabilidad de la escala del umbral','heredabilidad en la escala de umbral'), ('paternal','paterna'), ('parto y crianza','parto y crianza'), ('una cruz','un cruzamiento'), ('Inbreeding','Endogamia'), ('recesivos borrosos','recesivos deletéreos'), ('depresión que incide','depresión por endogamia'), ('encogida','con contracción'),('tarifas de llamada','tasas de genotipado'),('tasa de llamadas','tasa de genotipado'),('tasa de llamada','tasa de genotipado'),
 ('engendración','endogamia'),('endoblamiento','endogamia'),('endogamiento','endogamia'),('encintado','endogamia'),('insección','endogamia'),('insecticida','endogamia'),('inercia','endogamia'),
 ('recesos perversos','alelos recesivos deletéreos'),('hermanos completos','hermanos de padre y madre'),('hija padre','padre e hija'),
 ('adicción','aditividad'),('dominación','dominancia'),('predominio parcial','dominancia parcial'),('dominio completo','dominancia completa'),('sobredominio','sobredominancia'),('sobredominance','sobredominancia'),
 ('heterocigoo','heterocigoto'),('heterocigotes','heterocigotos'),('homocigosidad','homocigotos'),('heterois','heterosis'),('alele','alelo'),
 ('regla de torta','regla mal calibrada'),('gobernante','regla de medición'),('oleoducto','flujo de trabajo'),('portaaviones','portador'),
 ('desaparecidos','faltantes'),('desaparecido','faltante'),('desaparecidas','faltantes'),('desaparecida','faltante'),('desechos','residuo'),
 ('semi-sibs','medio hermanos'),('medio-sibs','medio hermanos'),('paternal race','raza paterna'),('carrera paternal','raza paterna'),('raza paternal','raza paterna'),
 ('mares','yeguas'),('fol','potro'),('diploidos','diploides'),('embarazadas','gestantes'),('embarazada','gestante'),('embarazo','gestación'),
 ('cría animal','mejoramiento genético animal'),('selección de masa','selección masal'),('rasgo del Umbral','carácter de umbral'),('características del Umbral','caracteres de umbral'),('característica del Umbral','carácter de umbral'),
 ('genético aditivo propio','genético aditivo propio'),('covariancia','covarianza'),('trama de Manhattan','gráfico de Manhattan'),('arvestos','se reduce'),
 ('precisión','exactitud'),('de novo','de nuevo'),('comercio','compromiso'),('genotipado error','error de genotipado'),
 ]}
 for locale,rows in cache.items():
  for source,value in rows.items():
   if locale in curated.get(source,{}):continue
   before=overrides.get(source,{}).get(locale,value)
   after=revise(before,[(a,b) for a,b in rules[locale] if a!=b])
   # Source-conditioned correction: human sex words must not replace animal sex.
   if locale=='es' and ('machos' in source or 'fêmea' in source):
    after=revise(after,[('hombres','machos'),('mujeres','hembras')])
   if after!=before:
    overrides.setdefault(source,{})[locale]=after
    changes.append({'sourceSha256':hashlib.sha256(source.encode()).hexdigest(),'locale':locale,'before':before,'after':after,'method':'editorial terminology correction'})
 manual=json.loads((P/'editorial-corrections.json').read_text()) if (P/'editorial-corrections.json').exists() else {}
 texts=json.loads((P/'source-plan.json').read_text())['texts']
 for index,values in manual.items():
  source=texts[int(index)]
  for locale,after in values.items():
   before=overrides.get(source,{}).get(locale,cache[locale][source])
   if before!=after:changes.append({'sourceSha256':hashlib.sha256(source.encode()).hexdigest(),'locale':locale,'before':before,'after':after,'method':'passage rewritten against Portuguese original'})
   overrides.setdefault(source,{})[locale]=after
 (P/'overrides.json').write_text(json.dumps(overrides,ensure_ascii=False,indent=2)+'\n')
 with (P/'editorial-changes.jsonl').open('a') as f:
  for row in changes:f.write(json.dumps(row,ensure_ascii=False)+'\n')
 print(json.dumps({'changedTranslations':len(changes),'manualPassages':len(manual),'overrides':len(overrides)}))
if __name__=='__main__':main()
