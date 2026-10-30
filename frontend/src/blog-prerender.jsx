import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import BlogPage from './BlogPage'
import { createTranslator } from './i18n'
export function renderBlog(slug = '') {
  return renderToStaticMarkup(<BlogPage slug={slug} locale="pt-BR" onLocaleChange={() => {}} t={createTranslator('pt-BR')} />)
}
