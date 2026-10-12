import React, { useEffect, useMemo, useState, lazy, Suspense } from 'react'
import { HomePage, CatalogPage } from './PublicPages'
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

export default function PublicSite() {
  const [locale, setLocale] = useState(detectInitialLocale())
  const [route, setRoute] = useState(() => publicRoute(window.location.hash))
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
  const shared = { publicAccess: true, locale, onLocaleChange: setLocale, t, onOpenCatalog: () => go('catalog'), onOpenCourse: id => go('course/' + id) }
  // Private account and administration retain their existing authentication flow.
  if (['auth', 'account', 'admin', 'verify-email'].includes(route.screen)) return <Suspense fallback={<main>Carregando…</main>}><App /></Suspense>
  if (route.screen === 'blog') return <Suspense fallback={<main role="status">Carregando blog…</main>}><BlogPage {...shared} slug={route.slug} /></Suspense>
  if (route.screen === 'catalog') return <CatalogPage {...shared} courseGroups={formatCourseGroups(curriculum.modules, locale)} onBack={() => go('')} />
  if (route.screen === 'course') {
    const course = courses.find(item => item.id === route.selectedCourseId)
    if (course) return <CoursePage {...shared} key={course.id} course={course} detail={formatCourseDetail(curriculum.modules.find(item => item.id === course.id), locale)} onBack={() => go('catalog')} nextCourse={courses[courses.indexOf(course) + 1] || null} />
    return <CatalogPage {...shared} courseGroups={formatCourseGroups(curriculum.modules, locale)} onBack={() => go('')} />
  }
  return <HomePage {...shared} status="" user={null} />
}
