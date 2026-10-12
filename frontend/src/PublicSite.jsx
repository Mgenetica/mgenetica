import React, { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react'
import SiteCatalog from './SiteCatalog'
import SiteHome from './SiteHome'
const BlogPage = lazy(() => import('./BlogPage'))
function publicRoute(hash) {
  const match = String(hash).match(/^#\/?blog(?:\/([^?]*))?$/)
  return match ? { screen: 'blog', slug: match[1] || '' } : parseRouteHash(hash)
}
const App = lazy(() => import('./App'))
import CoursePage from './CoursePage'
import curriculum from './data/legacy-curriculum.generated.json'
import { formatCourseCatalog, formatCourseDetail, formatCourseGroups } from './data/courseCurriculum'
import { createTranslator, detectInitialLocale } from './i18n'
import { parseRouteHash } from './lib/access.mjs'

const CONTENT_LOADERS = {
  en: () => import('./data/courseTranslations/en.json'),
  es: () => import('./data/courseTranslations/es.json')
}
const CONTENT_STATUS = {
  'pt-BR': ['Carregando conteúdo…', 'Não foi possível carregar o idioma.', 'Tentar novamente'],
  en: ['Loading content…', 'Could not load this language.', 'Try again'],
  es: ['Cargando contenido…', 'No se pudo cargar este idioma.', 'Intentar de nuevo']
}

export default function PublicSite() {
  const [locale, setLocale] = useState(detectInitialLocale())
  const [route, setRoute] = useState(() => publicRoute(window.location.hash))
  const [contentByLocale, setContentByLocale] = useState({})
  const [contentError, setContentError] = useState(false)
  const localeRequest = useRef(0)
  async function loadContent(language) {
    if (!CONTENT_LOADERS[language] || contentByLocale[language]) return
    const { default: content } = await CONTENT_LOADERS[language]()
    setContentByLocale(current => ({ ...current, [language]: content }))
  }
  async function changeLocale(language) {
    const request = ++localeRequest.current
    try {
      if (route.screen === 'course') await loadContent(language)
      if (request === localeRequest.current) { setContentError(false); setLocale(language) }
    } catch { setContentError(true) }
  }
  useEffect(() => {
    if (route.screen !== 'course') return
    loadContent(locale).then(() => setContentError(false)).catch(() => setContentError(true))
  }, [locale, route.screen])
  useEffect(() => {
    const update = () => setRoute(publicRoute(window.location.hash))
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  useEffect(() => {
    document.documentElement.lang = locale
    window.localStorage.setItem('mgenetica-locale', locale)
  }, [locale])
  const t = useMemo(() => {
    const translate = createTranslator(locale)
    const copy = locale === 'en' ? ['Open course', '21 modules and interactive labs. No registration required.'] : locale === 'es' ? ['Curso abierto', '21 módulos y laboratorios interactivos. Sin registro.'] : ['Curso aberto', '21 módulos e laboratórios interativos. Sem cadastro.']
    return (key, params) => key === 'publicCourse.title' ? copy[0] : key === 'publicCourse.copy' ? copy[1] : translate(key, params)
  }, [locale])
  const courses = formatCourseCatalog(curriculum.modules, locale)
  const go = hash => { window.location.hash = hash; window.scrollTo(0, 0) }
  const shared = { publicAccess: true, locale, onLocaleChange: changeLocale, contentNotice: contentError ? CONTENT_STATUS[locale]?.[1] : '', t, onOpenCatalog: () => go('catalog'), onOpenCourse: id => go('course/' + id) }
  // Private account and administration retain their existing authentication flow.
  if (['auth', 'account', 'admin', 'verify-email'].includes(route.screen)) return <Suspense fallback={<main>Carregando…</main>}><App /></Suspense>
  if (route.screen === 'blog') return <Suspense fallback={<main role="status">Carregando blog…</main>}><BlogPage {...shared} slug={route.slug} /></Suspense>
  if (route.screen === 'catalog') return <SiteCatalog {...shared} courseGroups={formatCourseGroups(curriculum.modules, locale)} onBack={() => go('')} />
  if (route.screen === 'course') {
    if (locale !== 'pt-BR' && !contentByLocale[locale]) {
      const status = CONTENT_STATUS[locale] || CONTENT_STATUS['pt-BR']
      return <main className="app-shell" role="status"><p>{status[contentError ? 1 : 0]}</p>{contentError && <button className="btn btn-primary" onClick={() => loadContent(locale).then(() => setContentError(false)).catch(() => setContentError(true))}>{status[2]}</button>}</main>
    }
    const course = courses.find(item => item.id === route.selectedCourseId)
    if (course) return <CoursePage {...shared} key={course.id} course={course} detail={formatCourseDetail(curriculum.modules.find(item => item.id === course.id), locale, contentByLocale[locale])} onBack={() => go('catalog')} nextCourse={courses[courses.indexOf(course) + 1] || null} />
    return <SiteCatalog {...shared} courseGroups={formatCourseGroups(curriculum.modules, locale)} onBack={() => go('')} />
  }
  return <SiteHome {...shared} />
}
