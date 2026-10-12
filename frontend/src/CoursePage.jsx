import React from 'react'
import Icon from './components/Icon'
import AppHeader from './components/AppHeader'
import ActionButton from './components/ActionButton'
import LessonText from './components/LessonText'
import LabEmbed from './components/LabEmbed'

const LAB_COPY = {
  'pt-BR': { eyebrow: 'Interativo', title: 'Laboratório interativo' },
  en: { eyebrow: 'Interactive', title: 'Interactive laboratory' },
  es: { eyebrow: 'Interactivo', title: 'Laboratorio interactivo' }
}

function CourseLab({ detail, locale }) {
  if (!detail?.lab) return null
  const copy = LAB_COPY[locale] || LAB_COPY['pt-BR']
  const title = `${copy.title}: ${detail.title}`

  return (
    <section className="section-card course-lab-card" aria-labelledby={`course-lab-title-${detail.id}`}>
      <div className="section-eyebrow">{copy.eyebrow}</div>
      <h3 id={`course-lab-title-${detail.id}`}>{copy.title}</h3>
      <p className="course-visual-caption">{detail.title}</p>
      <div className="course-lab-frame-wrap">
        <LabEmbed key={detail.lab} lab={detail.lab} title={title} locale={locale} />
      </div>
    </section>
  )
}

function SectionCard({ eyebrow, title, paragraphs, code, codeLabel, part, scientific }) {
  return (
    <section className={'section-card lesson-section' + (scientific ? ' scientific-section' : '')}>
      {eyebrow ? <div className="section-eyebrow">{eyebrow}</div> : null}
      <h3>{title}</h3>
      {part ? <div className="lesson-part-chip">{part}</div> : null}
      <LessonText paragraphs={paragraphs} />
      {code ? (
        <div className="code-panel" style={{ marginTop: 18 }}>
          <div className="code-caption">
            <strong>{codeLabel}</strong>
            <span>R</span>
          </div>
          <pre className="code-block"><code>{code}</code></pre>
        </div>
      ) : null}
    </section>
  )
}

function StudyPath({ detail }) {
  return (
    <section className="section-card study-path-card">
      <div className="section-eyebrow">{detail.courseTitle}</div>
      <h3>{detail.hierarchy}</h3>
      <p>{detail.blockTitle}: {detail.blockSummary}</p>
      <div className="study-parts study-parts-large" aria-label={detail.hierarchy}>
        {detail.studyParts.map((part) => <span key={part.id}>{part.label}</span>)}
      </div>
    </section>
  )
}

export default function CoursePage({ publicAccess = false, course, detail, progress, onBack, onOpenQuiz, onOpenCatalog, onOpenCourse, nextCourse, onLogout, loadingAuth, locale, onLocaleChange, contentNotice, t }) {
  return (
    <div className="app-shell">
      <AppHeader brandName={course.title} brandTagline={t('coursePage.dedicatedPage')} status="" locale={locale} onLocaleChange={onLocaleChange} t={t} className="course-header">
        <ActionButton type="button" variant="secondary" onClick={onBack} icon={<Icon name="arrowLeft" size={16} />}>
          {t('coursePage.backToCatalog')}
        </ActionButton>
        {onOpenCatalog ? (
          <ActionButton type="button" variant="secondary" onClick={onOpenCatalog} icon={<Icon name="layers" size={16} />}>
            {t('coursePage.catalog')}
          </ActionButton>
        ) : null}
        {!publicAccess && <ActionButton type="button" variant="secondary" onClick={onLogout} disabled={loadingAuth} icon={<Icon name="lock" size={16} />}>
          {t('common.logout')}
        </ActionButton>}
      </AppHeader>
      <a className="skip-link" href="#main-content">{t('common.skipToContent') || 'Skip to content'}</a>
      {detail ? (
        <main id="main-content" className="course-content stack" tabIndex="-1">
          {contentNotice && <p role="alert">{contentNotice}</p>}
          <article className="module-card">
            <div className="module-header">
              <div className="badge-row">
                <span className="module-badge">{detail.badge}</span>
                {detail.meta.map((item) => <span className="chip" key={item}>{item}</span>)}
              </div>
              <div className="module-meta">
                {detail.moduleMeta.map((item) => <React.Fragment key={item}><span>{item}</span></React.Fragment>)}
              </div>
            </div>
            <h2 className="module-title">{detail.title}</h2>
            <p className="module-description">{detail.description}</p>
          </article>
          <StudyPath detail={detail} />
          {!publicAccess && <section className="section-card">
            <div className="section-eyebrow">{t('coursePage.progressEyebrow')}</div>
            <h3>{t('coursePage.progressTitle')}</h3>
            <div className="content-grid catalog-grid">
              <article className="course-card">
                <strong className="course-title">{t('coursePage.progressPercent')}</strong>
                <p className="course-description">{progress ? t('coursePage.progressPercentValue', { percent: progress.percent }) : t('coursePage.progressEmpty')}</p>
              </article>
              <article className="course-card">
                <strong className="course-title">{t('coursePage.progressAssessment')}</strong>
                <p className="course-description">{progress ? (progress.passed ? t('coursePage.progressPassed') : t('coursePage.progressReview')) : t('coursePage.progressPending')}</p>
              </article>
              <article className="course-card">
                <strong className="course-title">{t('coursePage.progressAttempts')}</strong>
                <p className="course-description">{progress ? t('coursePage.progressAttemptsValue', { count: progress.attempts || 0 }) : t('coursePage.progressPending')}</p>
              </article>
            </div>
          </section>}
          {detail.sections.map((section, index) => (
            <React.Fragment key={`${detail.id}-${index}`}>
              <SectionCard
                eyebrow={section.eyebrow}
                title={section.title}
                paragraphs={section.paragraphs}
                code={section.code}
                codeLabel={section.codeLabel}
                part={detail.studyParts.find((part) => part.id === section.part)?.label}
                scientific={section.scientific}
              />
              {detail.lab && section.part === 'lab' ? <CourseLab detail={detail} locale={locale} /> : null}
            </React.Fragment>
          ))}
          {!publicAccess && <section className="section-card">
            <div className="section-eyebrow">{t('coursePage.actionEyebrow')}</div>
            <h3>{t('coursePage.actionTitle')}</h3>
            <p>{t('coursePage.afterQuizCopy')}</p>
            <div className="hero-actions section-actions">
              <ActionButton type="button" variant="primary" disabled={!onOpenQuiz} onClick={onOpenQuiz} icon={<Icon name="arrowRight" size={16} />}>
                {t('coursePage.openQuiz')}
              </ActionButton>
              <ActionButton type="button" variant="secondary" onClick={onBack} icon={<Icon name="arrowLeft" size={16} />}>
                {t('coursePage.backToCatalog')}
              </ActionButton>
            </div>
          </section>}
          <section className="section-card">
            <div className="section-eyebrow">{t('coursePage.closingEyebrow')}</div>
            <h3>{t('coursePage.closingTitle')}</h3>
            <p>{t('coursePage.closingCopy')}</p>
            <div className="module-nav section-actions">
              <button className="module-nav-card" type="button" onClick={onOpenCatalog}>
                <Icon name="layers" size={16} />
                <span>{t('coursePage.index')}</span>
                <strong>{t('coursePage.allModules')}</strong>
              </button>
              {nextCourse && onOpenCourse ? (
                <button className="module-nav-card" type="button" onClick={() => onOpenCourse(nextCourse.id)}>
                  <Icon name="arrowRight" size={16} />
                  <span>{t('coursePage.nextCourse')}</span>
                  <strong>{nextCourse.title}</strong>
                </button>
              ) : (
                <button className="module-nav-card" type="button" onClick={onOpenCatalog}>
                  <Icon name="arrowRight" size={16} />
                  <span>{t('coursePage.next')}</span>
                  <strong>{t('coursePage.nextCatalogFallback')}</strong>
                </button>
              )}
            </div>
          </section>
        </main>
      ) : (
        <main id="main-content" className="stack" tabIndex="-1">
          <article className="module-card">
            <div className="module-header">
              <div className="badge-row">
                <span className="module-badge">{course.id}</span>
                <span className="chip">{course.active ? t('common.available') : t('common.draft')}</span>
              </div>
              <div className="module-meta">
                <span>{t('common.dedicatedCourse')}</span>
              </div>
            </div>
            <h2 className="module-title">{course.title}</h2>
            <p className="module-description">{course.description}</p>
          </article>
          <section className="section-card">
            <div className="section-eyebrow">{t('coursePage.constructionEyebrow')}</div>
            <h3>{t('coursePage.constructionTitle')}</h3>
            <p>{t('coursePage.constructionCopy')}</p>
          </section>
        </main>
      )}
    </div>
  )
}
