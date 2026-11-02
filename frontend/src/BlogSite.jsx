import React, { useEffect, useState, lazy, Suspense } from 'react'
import BlogPage from './BlogPage'
const PrivateApp = lazy(() => import('./App'))
const base = import.meta.env.BASE_URL
function readRoute() {
  const hash = window.location.hash
  const oldPost = hash.match(/^#\/?blog\/([^?]+)/)
  if (oldPost) { window.location.replace(base + 'blog/' + oldPost[1] + '/'); return {} }
  const path = window.location.pathname.slice(base.length).replace(/^\/+|\/+$/g, '')
  const match = path.match(/^blog\/([^/]+)$/)
  return { slug: match?.[1] || (path && path !== 'blog' ? '__not-found__' : ''), unavailable: /^(#\/?(catalog|course))/.test(hash), private: /^#(auth|account|admin|verify-email)/.test(hash) }
}
export default function BlogSite() {
  const [route,setRoute] = useState(readRoute)
  useEffect(() => { const update = () => setRoute(readRoute()); window.addEventListener('hashchange',update); return () => window.removeEventListener('hashchange',update) },[])
  if (route.private) return <Suspense fallback={<p>Carregando…</p>}><PrivateApp /></Suspense>
  return <BlogPage slug={route.slug} unavailable={Boolean(route.unavailable)} locale="pt-BR" />
}
