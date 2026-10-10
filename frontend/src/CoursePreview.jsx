import React, { useState } from 'react'
import CoursePage from './CoursePage'
import curriculum from './data/legacy-curriculum.generated.json'
import { formatCourseCatalog, formatCourseDetail } from './data/courseCurriculum'
import { createTranslator } from './i18n'

export default function CoursePreview() {
  const [locale, setLocale] = useState('pt-BR')
  const [selected, setSelected] = useState(null)
  const courses = formatCourseCatalog(curriculum.modules, locale)
  const course = courses.find((row) => row.id === selected)
  const row = curriculum.modules.find((item) => item.id === selected)
  const t = createTranslator(locale)
  return <>
    <aside className="section-card" aria-label="Prévia do curso">
      <strong>Prévia local do curso · sem cadastro</strong>
      <p>Progresso e avaliações não são enviados ao servidor.</p>
      <label>Módulo <select value={selected || ''} onChange={(event) => setSelected(event.target.value || null)}>
        <option value="">Escolha um módulo</option>
        {courses.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
      </select></label>
    </aside>
    {course && <CoursePage course={course} detail={formatCourseDetail(row, locale)} progress={null}
      onBack={() => setSelected(null)} onOpenCatalog={() => setSelected(null)} onOpenCourse={setSelected}
      nextCourse={courses[courses.findIndex((item) => item.id === selected) + 1] || null}
      onLogout={() => setSelected(null)} loadingAuth={false} locale={locale} onLocaleChange={setLocale} t={t} />}
  </>
}
