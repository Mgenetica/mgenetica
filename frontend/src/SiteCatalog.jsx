import React from 'react'
import AppHeader from './components/AppHeader'
import './site-catalog.css'
const labels = {
  'pt-BR': ['Genética e melhoramento animal','Dos fundamentos biológicos à seleção genômica, com conceitos, exemplos e laboratórios para aprender na prática.','Começar a estudar','Sobre o curso','Conteúdo','O que você vai aprender','Percorra cinco eixos de estudo, conectando a biologia às decisões de melhoramento.','módulos','eixos de estudo','No seu ritmo','Acesso livre','Conteúdo do curso','Abrir módulo','Aprendizado prático','Leitura, conceitos, exercícios e laboratórios interativos.','Sem cadastro. Escolha um módulo e comece.'],
  en: ['Genetics and animal breeding','From biological foundations to genomic selection, with concepts, examples and labs for practical learning.','Start learning','About the course','Syllabus','What you will learn','Explore five study themes, connecting biology to breeding decisions.','modules','study themes','At your own pace','Open access','Course content','Open module','Practical learning','Reading, concepts, exercises and interactive labs.','No registration. Choose a module and start.'],
  es: ['Genética y mejora animal','De los fundamentos biológicos a la selección genómica, con conceptos, ejemplos y laboratorios para aprender en la práctica.','Empezar a estudiar','Sobre el curso','Contenido','Qué aprenderás','Recorre cinco ejes de estudio, conectando la biología con las decisiones de mejora.','módulos','ejes de estudio','A tu ritmo','Acceso libre','Contenido del curso','Abrir módulo','Aprendizaje práctico','Lectura, conceptos, ejercicios y laboratorios interactivos.','Sin registro. Elige un módulo y empieza.']
}
export default function SiteCatalog({courseGroups,locale,onLocaleChange,t}) {
 const c=labels[locale]||labels['pt-BR'];const total=courseGroups.reduce((n,g)=>n+g.courses.length,0)
 const jump=id=>document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'})
 return <div className="app-shell site-catalog">
  <a className="skip-link" href="#main-content" onClick={e=>{e.preventDefault();document.getElementById('main-content').focus()}}>{t('common.skipToContent')}</a>
  <AppHeader brandName="MGenética" brandTagline={t('common.brandTagline')} locale={locale} onLocaleChange={onLocaleChange} t={t} homeHref="#"><nav><a href="#">{locale === 'en' ? 'Home' : locale === 'es' ? 'Inicio' : 'Início'}</a><a href="#blog">Blog</a></nav></AppHeader>
  <main id="main-content" tabIndex={-1}>
   <section className="catalog-introduction"><p className="catalog-eyebrow">MGenética / {c[10]}</p><h1>{c[0]}</h1><p className="catalog-lead">{c[1]}</p><a className="catalog-start" href="#course/module-01">{c[2]} <span aria-hidden="true">→</span></a><p className="catalog-access">{c[15]}</p></section>
   <dl className="catalog-overview"><div><dt>{total}</dt><dd>{c[7]}</dd></div><div><dt>{courseGroups.length}</dt><dd>{c[8]}</dd></div><div><dt>R</dt><dd>{c[13]}</dd></div><div><dt>{c[9]}</dt><dd>{c[10]}</dd></div></dl>
   <nav className="catalog-tabs" aria-label={c[3]}><button onClick={()=>jump('catalog-about')}>{c[3]}</button><button onClick={()=>jump('catalog-syllabus')}>{c[4]}</button></nav>
   <div className="catalog-body"><div>
    <section id="catalog-about" className="catalog-about"><h2>{c[5]}</h2><p>{c[6]}</p><ul>{courseGroups.map(g=><li key={g.id}><span aria-hidden="true">✓</span>{g.summary}</li>)}</ul></section>
    <section id="catalog-syllabus" className="theme-stack catalog-syllabus"><h2>{c[11]}</h2>{courseGroups.map((g,i)=><details className="catalog-group" key={g.id}><summary><span className="catalog-group-number">{String(i+1).padStart(2,'0')}</span><span><strong>{g.title}</strong><small>{g.courses.length} {c[7]}</small></span><span className="catalog-expand" aria-hidden="true">+</span></summary><p className="catalog-group-description">{g.summary}</p><ol>{g.courses.map(m=><li key={m.id}><a href={'#course/'+m.id}><span className="catalog-module-number">{m.legacyId}</span><span><strong>{m.title}</strong><small>{m.description}</small></span><span aria-hidden="true">→</span></a></li>)}</ol></details>)}</section>
   </div><aside className="catalog-study"><h2>{c[13]}</h2><p>{c[14]}</p><div className="catalog-study-parts">{courseGroups[0]?.studyParts.map(p=><span key={p.id}>{p.label}</span>)}</div><p>{c[15]}</p></aside></div>
  </main>
 </div>
}
