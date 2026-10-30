import React from 'react'
import AppHeader from './components/AppHeader'
import './site-home.css'

const copy = {
  'pt-BR': { label: 'GENÉTICA · CIÊNCIA · EDUCAÇÃO', title: 'Entender a genética.\nTransformar decisões.', intro: 'Da biologia às análises em R: conhecimento para compreender a diversidade e pensar o melhoramento animal com rigor.', course: 'Explorar o curso', blog: 'Ler o blog', open: 'Acesso livre, no seu ritmo.', figure: 'Da variação à seleção', caption: 'Conectar conceitos, dados e decisões.', axis: 'Variação fenotípica', modules: 'módulos', themes: 'eixos de estudo', labs: 'laboratórios interativos', learn: 'APRENDER FAZENDO', heading: 'Uma trilha para ir além da teoria.', description: 'Comece pelos fundamentos. Explore modelos, interprete resultados e experimente os conceitos nos laboratórios.', steps: ['Fundamentos biológicos', 'Genética quantitativa', 'Genômica e seleção'], start: 'Começar pelo primeiro módulo', read: 'CIÊNCIA PARA ENTENDER', blogTitle: 'Pesquisa que cabe na conversa.', blogCopy: 'Textos explicativos sobre genética e melhoramento animal, aproximando artigos científicos de quem quer entender o mundo.', footer: 'Conhecimento aberto. Ciência com clareza.' },
  en: { label: 'GENETICS · SCIENCE · EDUCATION', title: 'Understand genetics.\nMake informed decisions.', intro: 'From biology to analyses in R: knowledge to understand diversity and approach animal breeding with scientific rigor.', course: 'Explore the course', blog: 'Read the blog', open: 'Open access, at your own pace.', figure: 'From variation to selection', caption: 'Connecting concepts, data and decisions.', axis: 'Phenotypic variation', modules: 'modules', themes: 'study themes', labs: 'interactive labs', learn: 'LEARN BY DOING', heading: 'A learning path beyond theory.', description: 'Start with the fundamentals. Explore models, interpret results and experiment with concepts in the labs.', steps: ['Biological foundations', 'Quantitative genetics', 'Genomics and selection'], start: 'Start with the first module', read: 'SCIENCE MADE CLEAR', blogTitle: 'Research worth talking about.', blogCopy: 'Accessible explanations of genetics and animal breeding, bringing scientific papers closer to curious readers.', footer: 'Open knowledge. Clear science.' },
  es: { label: 'GENÉTICA · CIENCIA · EDUCACIÓN', title: 'Entender la genética.\nTransformar decisiones.', intro: 'De la biología a los análisis en R: conocimiento para comprender la diversidad y abordar la mejora animal con rigor.', course: 'Explorar el curso', blog: 'Leer el blog', open: 'Acceso libre, a tu ritmo.', figure: 'De la variación a la selección', caption: 'Conectar conceptos, datos y decisiones.', axis: 'Variación fenotípica', modules: 'módulos', themes: 'ejes de estudio', labs: 'laboratorios interactivos', learn: 'APRENDER HACIENDO', heading: 'Un recorrido más allá de la teoría.', description: 'Empieza por los fundamentos. Explora modelos, interpreta resultados y experimenta con los conceptos en los laboratorios.', steps: ['Fundamentos biológicos', 'Genética cuantitativa', 'Genómica y selección'], start: 'Empezar por el primer módulo', read: 'CIENCIA PARA ENTENDER', blogTitle: 'Investigación para conversar.', blogCopy: 'Textos explicativos sobre genética y mejora animal que acercan los artículos científicos a quienes quieren comprender el mundo.', footer: 'Conocimiento abierto. Ciencia con claridad.' }
}

export default function SiteHome({ locale, onLocaleChange, t }) {
  const c = copy[locale] || copy['pt-BR']
  return <div className="site-home app-shell">
    <a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); document.getElementById('main-content').focus() }}>{t('common.skipToContent')}</a>
    <AppHeader brandName={t('common.brandName')} brandTagline={t('common.brandTagline')} locale={locale} onLocaleChange={onLocaleChange} t={t} homeHref="#">

      <nav aria-label={t('common.brandName')}><a href={import.meta.env.BASE_URL + 'blog/'}>Blog</a><a href="#catalog">{t('publicCourse.title')}</a></nav>
    </AppHeader>
    <main id="main-content" tabIndex={-1}>
      <section className="home-opening" aria-labelledby="home-title">
        <div className="home-opening-copy"><p className="home-kicker">{c.label}</p><h1 id="home-title">{c.title.split('\n').map((line, i) => <React.Fragment key={line}>{i > 0 && <br />}{line}</React.Fragment>)}</h1><p className="home-lead">{c.intro}</p><p className="home-access">{c.open}</p></div>

        <figure className="home-science home-science-light">
          <div className="home-figure-top"><span>MGenética</span><span>G × E</span></div>
          <h2>{c.figure}</h2>
          <svg viewBox="0 0 460 250" role="img" aria-label={c.axis}>
            {[65,115,165,215].map(y => <path key={y} d={`M20 ${y} H440`} stroke="#dce5ee" />)}
            <path d="M20 215 C95 215 105 202 135 152 S190 35 230 35 S285 102 325 160 S375 215 440 215 L440 235 H20Z" fill="#d6f1f9" />
            <path d="M20 215 C95 215 105 202 135 152 S190 35 230 35 S285 102 325 160 S375 215 440 215" fill="none" stroke="#1a4b78" strokeWidth="3" />
            <path d="M325 20 V230" stroke="#00a8d6" strokeWidth="2" strokeDasharray="4 6" />
            <circle cx="325" cy="160" r="5" fill="#00a8d6" />
            <path d="M20 235 H440" stroke="#5a7391" />
          </svg>
          <div className="home-figure-axis"><span>−</span><span>{c.axis}</span><span>+</span></div>
          <figcaption>{c.caption}</figcaption>
        </figure>
      </section>

    </main><footer className="home-footer"><strong>MGenética</strong><span>{c.footer}</span></footer>
  </div>
}
