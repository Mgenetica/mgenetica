import React from 'react'
import Icon from './components/Icon'
import AppHeader from './components/AppHeader'
import { BRAND_LOGO_URL } from './lib/branding'
function SkipLink({t}) { return <a className="skip-link" href="#main-content">{t('common.skipToContent')}</a> }
export function HomePage({ publicAccess = false, user, status, loadingAuth, isAdmin, onAuthIntent, onLogout, onOpenCatalog, onOpenAccount, onOpenAdmin, locale, onLocaleChange, t }) {
  const benefits = t('home.benefits')
  const trust = t('home.trust')
  return (
    <div className="app-shell">
      <SkipLink t={t} />
      <AppHeader brandName={t('common.brandName')} brandTagline={t('common.brandTagline')} status={status} locale={locale} onLocaleChange={onLocaleChange} t={t} homeHref="#">
        {user ? (
          <>
            <a className="btn btn-secondary" href="#catalog" onClick={onOpenCatalog} aria-label={t('home.openCatalogAria')}>
              <Icon name="layers" size={16} />
              {t('common.learnerArea')}
            </a>
            <a className="btn btn-secondary" href="#account" onClick={onOpenAccount} aria-label={t('account.openAria')}>
              <Icon name="user" size={16} />
              {t('common.profile')}
            </a>
            {isAdmin ? <a className="btn btn-secondary" href="#admin" onClick={onOpenAdmin} aria-label={t('home.openAdminAria')}><Icon name="check" size={16} />{t('common.admin')}</a> : null}
            <button type="button" className="btn btn-secondary" onClick={onLogout} disabled={loadingAuth} aria-label={t('home.logoutAria')}><Icon name="arrowLeft" size={16} />{t('common.logout')}</button>
          </>
        ) : (
          <a className="btn btn-primary" href={publicAccess ? '#catalog' : '#auth'} onClick={publicAccess ? onOpenCatalog : () => onAuthIntent('login')}>{publicAccess ? t('catalog.heading') : t('home.signIn')}</a>
        )}
      </AppHeader>
      <main id="main-content" className="landing-stack" tabIndex="-1">
        <section className="hero-shell">
          <div className="hero-main">
            <div className="hero-copy-card">
              <div className="hero-eyebrow">{t('home.eyebrow')}</div>
              <h1 className="hero-headline">{t('home.headline')}</h1>
              <p className="hero-description">{t('home.description')}</p>
              <div className="hero-cta">
                <a className="btn btn-primary" href="#catalog" onClick={onOpenCatalog}><Icon name="arrowRight" size={16} />{t('catalog.heading')}</a>
                <a className="btn btn-secondary" href="#course/module-01">{t('catalog.openPage')} · M01</a>
              </div>
            </div>
            <aside className="hero-brand-card">
              <div className="hero-proof-mark">
                <img src={BRAND_LOGO_URL} alt="" aria-hidden="true" />
                <span>{t('home.proofKicker')}</span>
              </div>
              <div className="visual-caption"><strong>{t('home.proofTitle')}</strong><p>{t('home.proofCopy')}</p></div>
              <div className="hero-proof-metrics" aria-label={t('home.proofMetricsAria')}>
                <div><strong>{t('home.proofMetricModulesValue')}</strong><span>{t('home.proofMetricModulesLabel')}</span></div>
                <div><strong>{t('home.proofMetricAxesValue')}</strong><span>{t('home.proofMetricAxesLabel')}</span></div>
                <div><strong>{t('home.proofMetricCodeValue')}</strong><span>{t('home.proofMetricCodeLabel')}</span></div>
              </div>
              <div className="brand-meta">
                <div className="brand-meta-item"><Icon name="book" size={15} /><span>{t('home.proofConcept')}</span></div>
                <div className="brand-meta-item"><Icon name="layers" size={15} /><span>{t('home.proofCode')}</span></div>
                <div className="brand-meta-item"><Icon name="check" size={15} /><span>{t('home.proofDecision')}</span></div>
              </div>
            </aside>
          </div>
        </section>
        <section className="benefits-grid" aria-label={t('home.benefitsAria')}>
          <article className="benefit-card"><div className="benefit-icon"><Icon name="book" size={18} /></div><strong>{benefits.reproducible.title}</strong><p>{benefits.reproducible.copy}</p></article>
          <article className="benefit-card"><div className="benefit-icon"><Icon name="layers" size={18} /></div><strong>{benefits.science.title}</strong><p>{benefits.science.copy}</p></article>
          <article className="benefit-card"><div className="benefit-icon"><Icon name="lock" size={18} /></div><strong>{publicAccess ? t('publicCourse.title') : benefits.access.title}</strong><p>{publicAccess ? t('publicCourse.copy') : benefits.access.copy}</p></article>
        </section>
      </main>
      {user ? (
        <section className="learner-section">
          <div className="section-label">{t('home.learner.label')}</div>
          <h2 className="section-heading">{t('home.learner.heading')}</h2>
          <p className="section-description">{t('home.learner.copy')}</p>
          <div className="section-cta" style={{ marginTop: 16 }}>
            <button type="button" className="btn btn-primary" onClick={onOpenCatalog}>{t('home.learner.openCourses')}</button>
            <button type="button" className="btn btn-secondary" onClick={onOpenAccount}>{t('account.open')}</button>
            <button type="button" className="btn btn-secondary" onClick={onLogout} disabled={loadingAuth}>{t('home.learner.logout')}</button>
          </div>
        </section>
      ) : (
        <section className="trust-section" role="list" aria-label={t('home.trustAria')}>
          <article className="trust-item" role="listitem"><strong>{trust.rigor.title}</strong><p>{trust.rigor.copy}</p></article>
          <article className="trust-item" role="listitem"><strong>{trust.clarity.title}</strong><p>{trust.clarity.copy}</p></article>
          <article className="trust-item" role="listitem"><strong>{trust.practice.title}</strong><p>{trust.practice.copy}</p></article>
        </section>
      )}
    </div>
  )
}


export function CatalogPage({ publicAccess = false, courseGroups, progressByCourse, progressSummary, isAdmin, onBack, onOpenCourse, onOpenAccount, onOpenAdmin, onLogout, loadingAuth, locale, onLocaleChange, t }) {
  return (
    <div className="app-shell">
      <SkipLink t={t} />
      <AppHeader brandName={t('catalog.brandName')} brandTagline={t('catalog.brandTagline')} status={''} locale={locale} onLocaleChange={onLocaleChange} t={t}>
        <button type="button" className="btn btn-secondary" onClick={onBack} aria-label={t('catalog.backHomeAria')}><Icon name="arrowLeft" size={16} />{t('common.back')}</button>
        {!publicAccess && <button type="button" className="btn btn-secondary" onClick={onOpenAccount} aria-label={t('account.openAria')}><Icon name="user" size={16} />{t('common.profile')}</button>}
        {isAdmin ? <button type="button" className="btn btn-secondary" onClick={onOpenAdmin} aria-label={t('catalog.openAdminAria')}><Icon name="check" size={16} />{t('common.admin')}</button> : null}
        {!publicAccess && <button type="button" className="btn btn-secondary" onClick={onLogout} disabled={loadingAuth} aria-label={t('catalog.logoutAria')}><Icon name="lock" size={16} />{t('common.logout')}</button>}
      </AppHeader>
      <main id="main-content" className="content-section" tabIndex="-1">
        <div className="section-label">{t('catalog.label')}</div>
        <h2 className="section-heading">{t('catalog.heading')}</h2>
        <p className="section-description">{publicAccess ? t('publicCourse.copy') : t('catalog.progressOverview', { tracked: progressSummary?.totalCoursesTracked || 0, passed: progressSummary?.passedCourses || 0, average: progressSummary?.averagePercent || 0 })}</p>
        <div className="theme-stack" role="list" aria-label={t('catalog.coursesAria')}>
          {courseGroups.map((group) => (
            <section className="theme-section" role="listitem" key={group.id} aria-labelledby={'theme-' + group.id}>
              <div className="theme-header">
                <div>
                  <div className="section-label">{group.mainThemeLabel} {group.order}</div>
                  <h3 id={'theme-' + group.id}>{group.title}</h3>
                  <p>{group.summary}</p>
                </div>
                <div className="study-parts" aria-label={group.hierarchy}>
                  {group.studyParts.map((part) => <span key={part.id}>{part.label}</span>)}
                </div>
              </div>
              <div className="content-grid catalog-grid" role="list" aria-label={group.title}>
                {group.courses.map((course) => {
                  const progress = progressByCourse?.[course.id]
                  return (
                    <article className="course-card study-block-card" role="listitem" key={course.id}>
                      <div className="badge-row">
                        <span className="chip">{course.legacyId}</span>
                        <span className="chip">{course.studyBlockLabel}</span>
                        {!publicAccess && <span className="chip">{progress ? t('catalog.progressChip', { percent: progress.percent }) : t('catalog.notStarted')}</span>}
                      </div>
                      <strong className="course-title">{course.title}</strong>
                      <p className="course-description">{course.description}</p>
                      <div className="course-meta">
                        <span className="status-badge">{course.active ? t('common.available') : t('common.draft')}</span>
                        {progress?.passed ? <span className="status-badge">{t('catalog.passed')}</span> : null}
                      </div>
                      <button type="button" className="btn btn-primary course-action" onClick={() => onOpenCourse(course.id)} aria-label={t('catalog.openCourseAria', { title: course.title })}>{t('catalog.openPage')}</button>
                    </article>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
