import { HomePage, CatalogPage } from './PublicPages'
import React, { Suspense, lazy, useEffect, useMemo, useState} from 'react'
import { formatCourseCatalog, formatCourseDetail, formatCourseGroups } from './data/courseCurriculum'
import Icon from './components/Icon'
import AppHeader from './components/AppHeader'
import { BRAND_LOGO_URL } from './lib/branding'
import { buildRouteHash, parseRouteHash, routeNeedsAdmin, routeNeedsAuth, routeNeedsVerifiedEmail } from './lib/access.mjs'
import { createTranslator, detectInitialLocale, LOCALE_STORAGE_KEY, normalizeLocale } from './i18n'
import {
  pingAppwrite,
  listCourses,
  getCourseDetail,
  getProgress,
  updateProgress,
  getAuthCapabilities,
  getAdminStatus,
  getAdminSummary,
  createEmailSession,
  createAccount,
  createEmailVerification,
  completeEmailVerification,
  deleteAllSessions,
  deleteSession,
  getAccount,
  updateAccountName,
  normalizeAuthError,
  functionIds,
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  PUBLIC_SITE_URL
} from './lib/appwrite'

const CoursePage = lazy(() => import('./CoursePage'))
const Quiz = lazy(() => import('./Quiz'))
let localCourseRowsPromise = null
const RESEND_VERIFICATION_COOLDOWN_SECONDS = 60

function loadLocalCourseRows() {
  if (!localCourseRowsPromise) {
    localCourseRowsPromise = import('./data/legacy-curriculum.generated.json')
      .then((module) => (Array.isArray(module.default?.modules) ? module.default.modules : []))
  }
  return localCourseRowsPromise
}

function SkipLink({ t }) {
  return <a className="skip-link" href="#main-content">{t('common.skipToContent') || 'Skip to content'}</a>
}

function LoadingScreen({ t }) {
  return (
    <div className="app-shell">
      <SkipLink t={t} />
      <main id="main-content" className="content-section" tabIndex="-1" aria-busy="true">
        <div className="section-label">{t('common.status')}</div>
        <h1 className="section-heading">{t('status.syncing')}</h1>
      </main>
    </div>
  )
}

function AuthPanel({ user, mode, onModeChange, onLogin, onSignup, onLogout, loading, t, errorMessages }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
  }, [mode, user])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'signup') await onSignup({ email, password, name })
      else await onLogin({ email, password })
      setPassword('')
    } catch (err) {
      setError(normalizeAuthError(err, errorMessages))
    }
  }

  return (
    <aside className="auth-card">
      <div className="auth-header">
        <div>
          <h2 className="auth-title">{user ? t('authPanel.connectedTitle') : t('authPanel.defaultTitle')}</h2>
          <p className="subtle" style={{ margin: '6px 0 0' }}>
            {user ? t('authPanel.connectedCopy', { name: user.name || user.email || user.$id }) : t('authPanel.defaultCopy')}
          </p>
        </div>
      </div>
      {!user ? (
        <>
          <div className="auth-tabs">
            <button type="button" className={'tab ' + (mode === 'login' ? 'active' : '')} onClick={() => onModeChange('login')}>
              <Icon name="user" size={16} />
              {t('authPanel.tabLogin')}
            </button>
            <button type="button" className={'tab ' + (mode === 'signup' ? 'active' : '')} onClick={() => onModeChange('signup')}>
              <Icon name="lock" size={16} />
              {t('authPanel.tabSignup')}
            </button>
          </div>
          <p className="auth-note">{mode === 'login' ? t('authPanel.loginNote') : t('authPanel.signupNote')}</p>
          <form onSubmit={handleSubmit}>
            {mode === 'signup' ? (
              <div className="field">
                <label htmlFor="name">{t('authPanel.name')}</label>
              <input id="name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('authPanel.namePlaceholder')} />
            </div>
          ) : null}
          <div className="field">
            <label htmlFor="email">{t('authPanel.email')}</label>
              <input id="email" name="email" autoComplete="email" spellCheck={false} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('authPanel.emailPlaceholder')} required aria-invalid={error ? 'true' : undefined} aria-describedby={error ? 'auth-error' : undefined} />
          </div>
          <div className="field">
            <label htmlFor="password">{t('authPanel.password')}</label>
              <input id="password" name="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required aria-invalid={error ? 'true' : undefined} aria-describedby={error ? 'auth-error' : undefined} />
          </div>
            {error ? <div id="auth-error" className="callout-card" role="alert" aria-live="assertive" style={{ borderColor: 'rgba(180, 38, 38, 0.16)', color: '#8a1f1f' }}>{error}</div> : null}
            <div className="auth-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Icon name="arrowRight" size={16} />
                {loading ? t('authPanel.loading') : mode === 'login' ? t('authPanel.tabLogin') : t('authPanel.createAccount')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}>
                {mode === 'login' ? t('authPanel.wantCreateAccount') : t('authPanel.alreadyHaveAccount')}
              </button>
            </div>
          </form>
        </>
      ) : (
        <div className="login-cta">
          <div className="pill">
            <Icon name="check" size={14} />
            {t('authPanel.activeSession')}
          </div>
          <div className="auth-status">
            <strong>{user.email || user.name || user.$id}</strong>
            <div className="subtle" style={{ marginTop: 6 }}>{t('authPanel.activeCopy')}</div>
          </div>
          <button type="button" className="btn btn-secondary" onClick={onLogout}>
            <Icon name="arrowLeft" size={16} />
            {t('home.learner.logout')}
          </button>
        </div>
      )}
    </aside>
  )
}

function AuthPage({ user, status, authMode, loadingAuth, isAdmin, onAuthIntent, onLogin, onSignup, onLogout, onOpenCatalog, onOpenAccount, onOpenAdmin, locale, onLocaleChange, t, errorMessages }) {
  return (
    <div className="app-shell">
      <SkipLink t={t} />
      <AppHeader brandName={t('authPage.brandName')} brandTagline={t('authPage.brandTagline')} status={status} locale={locale} onLocaleChange={onLocaleChange} t={t}>
        {user ? (
          <>
            <button type="button" className="btn btn-secondary" onClick={onOpenCatalog}><Icon name="layers" size={16} />{t('common.learnerArea')}</button>
            <button type="button" className="btn btn-secondary" onClick={onOpenAccount}><Icon name="user" size={16} />{t('common.profile')}</button>
            {isAdmin ? <button type="button" className="btn btn-secondary" onClick={onOpenAdmin}><Icon name="check" size={16} />{t('common.admin')}</button> : null}
            <button type="button" className="btn btn-secondary" onClick={onLogout} disabled={loadingAuth}><Icon name="arrowLeft" size={16} />{t('common.logout')}</button>
          </>
        ) : null}
      </AppHeader>
      <main id="main-content" className="auth-page-shell" tabIndex="-1">
        <div className="auth-page-intro">
          <div className="hero-eyebrow">{t('authPage.eyebrow')}</div>
          <h1 className="section-heading auth-page-heading">{t('authPage.heading')}</h1>
          <p className="section-description auth-page-copy">{t('authPage.copy')}</p>
        </div>
        <AuthPanel user={user} mode={authMode} onModeChange={onAuthIntent} loading={loadingAuth} onLogin={onLogin} onSignup={onSignup} onLogout={onLogout} t={t} errorMessages={errorMessages} />
      </main>
    </div>
  )
}

function AccountPage({ user, courses, progressByCourse, progressSummary, isAdmin, onBack, onOpenCatalog, onOpenCourse, onOpenAdmin, onLogout, onLogoutAll, onUpdateProfile, onResendVerification, onRefreshUser, loadingAuth, locale, onLocaleChange, t }) {
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const [verificationSaving, setVerificationSaving] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [message, setMessage] = useState('')
  const trackedCourses = courses.map((course) => ({ course, progress: progressByCourse?.[course.id] || null }))
  const resendDisabled = verificationSaving || resendCooldown > 0
  const resendLabel = resendCooldown > 0 ? t('verification.resendCooldown', { seconds: resendCooldown }) : t('verification.resendEmail')

  useEffect(() => {
    setName(user?.name || '')
  }, [user?.name])

  useEffect(() => {
    if (resendCooldown <= 0) return undefined
    const timer = window.setTimeout(() => setResendCooldown((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [resendCooldown])

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await onUpdateProfile({ name: name.trim() })
      setMessage(t('account.profileSaved'))
    } catch (err) {
      setMessage(err?.message || t('account.profileSaveError'))
    } finally {
      setSaving(false)
    }
  }

  async function handleVerificationAction(action, successKey, fallbackKey, { cooldown = false } = {}) {
    setVerificationSaving(true)
    setMessage('')
    try {
      await action()
      if (cooldown) setResendCooldown(RESEND_VERIFICATION_COOLDOWN_SECONDS)
      setMessage(t(successKey))
    } catch (err) {
      setMessage(err?.message || t(fallbackKey))
    } finally {
      setVerificationSaving(false)
    }
  }

  return (
    <div className="app-shell">
      <SkipLink t={t} />
      <AppHeader brandName={t('account.brandName')} brandTagline={t('account.brandTagline')} status={message} locale={locale} onLocaleChange={onLocaleChange} t={t}>
        <button type="button" className="btn btn-secondary" onClick={onBack}><Icon name="arrowLeft" size={16} />{t('common.back')}</button>
        <button type="button" className="btn btn-secondary" onClick={onOpenCatalog}><Icon name="layers" size={16} />{t('common.learnerArea')}</button>
        {isAdmin ? <button type="button" className="btn btn-secondary" onClick={onOpenAdmin}><Icon name="check" size={16} />{t('common.admin')}</button> : null}
        <button type="button" className="btn btn-secondary" onClick={onLogout} disabled={loadingAuth}><Icon name="lock" size={16} />{t('common.logout')}</button>
      </AppHeader>
      <main id="main-content" className="account-layout" tabIndex="-1">
        <section className="content-section account-profile-panel">
          <div className="section-label">{t('account.profileLabel')}</div>
          <h1 className="section-heading">{t('account.heading')}</h1>
          <p className="section-description">{t('account.copy')}</p>
          <form className="account-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="account-name">{t('account.name')}</label>
              <input id="account-name" name="name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder={t('account.namePlaceholder')} />
            </div>
            <div className="field">
              <label htmlFor="account-email">{t('account.email')}</label>
              <input id="account-email" name="email" type="email" value={user?.email || ''} readOnly />
            </div>
            <div className="account-meta-grid">
              <div><span>{t('account.accountId')}</span><strong>{user?.$id || '-'}</strong></div>
              <div><span>{t('account.emailVerified')}</span><strong>{user?.emailVerification ? t('account.yes') : t('account.no')}</strong></div>
              <div><span>{t('account.registeredAt')}</span><strong>{user?.registration ? new Date(user.registration).toLocaleDateString(locale) : '-'}</strong></div>
            </div>
            {!user?.emailVerification ? (
              <div className="callout-card" role="status" aria-live="polite">
                <strong>{t('verification.requiredTitle')}</strong>
                <p className="subtle" style={{ margin: '6px 0 0' }}>{t('verification.requiredCopy', { email: user?.email || '-' })}</p>
                <p className="subtle" style={{ margin: '6px 0 0' }}>{t('verification.inboxGuidance')}</p>
                <div className="section-cta" style={{ marginTop: 12 }}>
                  <button type="button" className="btn btn-primary" disabled={resendDisabled} onClick={() => handleVerificationAction(onResendVerification, 'verification.emailSent', 'verification.emailSendError', { cooldown: true })}>{resendLabel}</button>
                  <button type="button" className="btn btn-secondary" disabled={verificationSaving} onClick={() => handleVerificationAction(onRefreshUser, 'verification.accountRefreshed', 'verification.refreshError')}>{t('verification.refreshStatus')}</button>
                </div>
              </div>
            ) : null}
            <div className="account-security-card">
              <div>
                <span className="section-label">{t('account.securityLabel')}</span>
                <h2>{t('account.securityHeading')}</h2>
                <p className="subtle">{t('account.securityCopy')}</p>
              </div>
              <div className="account-meta-grid compact">
                <div><span>{t('account.emailVerified')}</span><strong>{user?.emailVerification ? t('account.yes') : t('account.no')}</strong></div>
                <div><span>{t('account.currentSession')}</span><strong>{loadingAuth ? t('account.sessionChanging') : t('account.sessionActive')}</strong></div>
              </div>
              <button type="button" className="btn btn-secondary" onClick={onLogoutAll} disabled={loadingAuth}>{t('account.logoutAll')}</button>
            </div>
            {message ? <div className="callout-card" role="status" aria-live="polite">{message}</div> : null}
            <div className="section-cta">
              <button type="submit" className="btn btn-primary" disabled={saving}><Icon name="check" size={16} />{saving ? t('account.saving') : t('account.saveProfile')}</button>
            </div>
          </form>
        </section>
        <section className="content-section account-progress-panel">
          <div className="section-label">{t('account.coursesLabel')}</div>
          <h2 className="section-heading">{user?.emailVerification ? t('account.coursesHeading') : t('verification.lockedHeading')}</h2>
          <p className="section-description">{user?.emailVerification ? t('account.progressOverview', { tracked: progressSummary?.totalCoursesTracked || 0, passed: progressSummary?.passedCourses || 0, average: progressSummary?.averagePercent || 0 }) : t('verification.lockedCopy')}</p>
          {user?.emailVerification ? (
            <>
              <div className="account-summary-grid">
                <article><strong>{progressSummary?.totalCoursesTracked || 0}</strong><span>{t('account.tracked')}</span></article>
                <article><strong>{progressSummary?.passedCourses || 0}</strong><span>{t('account.passed')}</span></article>
                <article><strong>{progressSummary?.averagePercent || 0}%</strong><span>{t('account.average')}</span></article>
              </div>
              <div className="enrollment-list" role="list" aria-label={t('account.coursesHeading')}>
                {trackedCourses.map(({ course, progress }) => (
                  <article className="enrollment-card" role="listitem" key={course.id}>
                    <div>
                      <div className="badge-row">
                        <span className="chip">{course.legacyId}</span>
                        <span className="chip">{progress ? t('catalog.progressChip', { percent: progress.percent }) : t('catalog.notStarted')}</span>
                        {progress?.passed ? <span className="chip">{t('catalog.passed')}</span> : null}
                      </div>
                      <strong className="course-title">{course.title}</strong>
                      <p className="course-description">{course.description}</p>
                    </div>
                    <div className="progress-meter" aria-label={t('account.courseProgress', { percent: progress?.percent || 0 })}>
                      <span style={{ width: (progress?.percent || 0) + '%' }} />
                    </div>
                    <button type="button" className="btn btn-primary course-action" onClick={() => onOpenCourse(course.id)}>{progress ? t('account.continueCourse') : t('account.startCourse')}</button>
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </section>
      </main>
    </div>
  )
}

function VerificationPage({ route, user, status, loading, state, onBack, onOpenAccount, onAuthIntent, onLogout, locale, onLocaleChange, t }) {
  const hasTokens = Boolean(route?.verificationUserId && route?.verificationSecret)
  const isFailed = state === 'failed'
  const isMissing = state === 'missing' || !hasTokens
  const isSuccess = state === 'success'
  const title = isFailed ? t('verification.failedTitle') : isMissing ? t('verification.missingTitle') : isSuccess ? t('verification.successTitle') : t('verification.processingTitle')
  const copy = isFailed ? t('verification.failedCopy') : isMissing ? t('verification.missingCopy') : isSuccess ? t('verification.successCopy') : t('verification.processingCopy')
  return (
    <div className="app-shell">
      <SkipLink t={t} />
      <AppHeader brandName={t('verification.brandName')} brandTagline={t('verification.brandTagline')} status={status} locale={locale} onLocaleChange={onLocaleChange} t={t}>
        <button type="button" className="btn btn-secondary" onClick={onBack}><Icon name="arrowLeft" size={16} />{t('common.back')}</button>
        {user ? <button type="button" className="btn btn-secondary" onClick={onLogout} disabled={loading}><Icon name="lock" size={16} />{t('common.logout')}</button> : null}
      </AppHeader>
      <main id="main-content" className="content-section verification-panel" tabIndex="-1" aria-busy={loading ? 'true' : undefined}>
        <div className="section-label">{t('verification.label')}</div>
        <h1 className="section-heading">{title}</h1>
        <p className="section-description">{copy}</p>
        {isFailed || isMissing ? (
          <div className="callout-card" role="alert">
            <strong>{t('verification.nextStepTitle')}</strong>
            <p className="subtle" style={{ margin: '6px 0 0' }}>{t('verification.nextStepCopy')}</p>
            <div className="section-cta" style={{ marginTop: 12 }}>
              {user ? <button type="button" className="btn btn-primary" onClick={onOpenAccount}>{t('account.open')}</button> : <button type="button" className="btn btn-primary" onClick={() => onAuthIntent('login')}>{t('common.signIn')}</button>}
              <button type="button" className="btn btn-secondary" onClick={onBack}>{t('common.home')}</button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}

function AdminPage({ user, status, report, loading, onBack, onRefresh, onLogout, loadingAuth, locale, onLocaleChange, t }) {
  const adminConfigured = report?.admin?.appwrite?.adminApiConfigured
  const adminEmailsConfigured = report?.admin?.checks?.adminEmailsConfigured
    ?? ((report?.admin?.checks?.configuredAdminEmails ?? 0) > 0)
  const learnerProgress = report?.summary?.summary?.learnerProgress
  return (
    <div className="app-shell">
      <SkipLink t={t} />
      <AppHeader brandName={t('common.admin')} brandTagline={t('adminPage.brandTagline')} status={status} locale={locale} onLocaleChange={onLocaleChange} t={t}>
        <button type="button" className="btn btn-secondary" onClick={onBack}><Icon name="arrowLeft" size={16} />{t('common.back')}</button>
        <button type="button" className="btn btn-secondary" onClick={onLogout} disabled={loadingAuth}><Icon name="lock" size={16} />{t('common.logout')}</button>
      </AppHeader>
      <main id="main-content" tabIndex="-1">
      <section className="content-section">
        <div className="section-label">{t('adminPage.label')}</div>
        <h2 className="section-heading">{t('adminPage.heading')}</h2>
        <p className="section-description">{t('adminPage.copy')}</p>
        <div className="section-cta" style={{ marginTop: 16 }}>
          <button type="button" className="btn btn-primary" onClick={onRefresh} disabled={loading}>{loading ? t('adminPage.runningChecks') : t('adminPage.runChecks')}</button>
          <a className="btn btn-secondary" href={PUBLIC_SITE_URL} target="_blank" rel="noopener noreferrer">{t('common.openLiveUrl')}</a>
        </div>
      </section>
      <section className="content-section"><div className="content-grid catalog-grid"><article className="course-card"><strong className="course-title">{t('adminPage.session')}</strong><p className="course-description">{user?.email || user?.name || user?.$id || t('adminPage.noUser')}</p></article><article className="course-card"><strong className="course-title">{t('adminPage.appwrite')}</strong><p className="course-description">{APPWRITE_ENDPOINT}</p></article><article className="course-card"><strong className="course-title">{t('adminPage.project')}</strong><p className="course-description">{APPWRITE_PROJECT_ID}</p></article></div></section>
      <section className="content-section"><div className="content-grid catalog-grid"><article className="course-card"><strong className="course-title">{t('adminPage.learnersTracked')}</strong><p className="course-description">{learnerProgress?.trackedLearners ?? 0}</p></article><article className="course-card"><strong className="course-title">{t('adminPage.modulesTracked')}</strong><p className="course-description">{learnerProgress?.totalTrackedModules ?? 0}</p></article><article className="course-card"><strong className="course-title">{t('adminPage.averageProgress')}</strong><p className="course-description">{t('adminPage.averageProgressValue', { percent: learnerProgress?.averagePercent ?? 0 })}</p></article><article className="course-card"><strong className="course-title">{t('adminPage.modulesPassed')}</strong><p className="course-description">{learnerProgress?.passedModules ?? 0}</p></article></div></section>
      <section className="content-section"><div className="content-grid catalog-grid">{Object.entries(functionIds).map(([key, value]) => <article className="course-card" key={key}><strong className="course-title">{key}</strong><p className="course-description">{value}</p></article>)}</div></section>
      <section className="content-section"><div className="panel" style={{ padding: 18 }}><strong style={{ display: 'block', marginBottom: 12 }}>{t('adminPage.requiredConfigTitle')}</strong><p className="section-description" style={{ marginBottom: 12 }}>{t('adminPage.requiredConfigCopy')}</p><div className="content-grid catalog-grid"><article className="course-card"><strong className="course-title">ADMIN_EMAILS</strong><p className="course-description">{t('adminPage.adminEmailsCopy')}</p></article><article className="course-card"><strong className="course-title">APPWRITE_ADMIN_API_KEY</strong><p className="course-description">{t('adminPage.adminApiKeyCopy')}</p></article><article className="course-card"><strong className="course-title">APPWRITE_API_KEY</strong><p className="course-description">{t('adminPage.fallbackApiKeyCopy')}</p></article></div><p className="subtle" style={{ margin: '14px 0 0' }}>{t('adminPage.currentStatus', { configured: String(Boolean(adminConfigured)), adminEmailsConfigured: String(Boolean(adminEmailsConfigured)) })}</p></div></section>
      <section className="content-section"><div className="panel" style={{ padding: 18 }}><strong style={{ display: 'block', marginBottom: 12 }}>{t('adminPage.reportTitle')}</strong><pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.5 }}>{JSON.stringify(report || { info: t('adminPage.noChecks') }, null, 2)}</pre></div></section>
      </main>
    </div>
  )
}

export default function App() {
  const initialRoute = parseRouteHash(typeof window !== 'undefined' ? window.location.hash : '')
  const [locale, setLocale] = useState(detectInitialLocale())
  const [user, setUser] = useState(null)
  const [authResolved, setAuthResolved] = useState(false)
  const [loadingAuth, setLoadingAuth] = useState(false)
  const [loadingAdmin, setLoadingAdmin] = useState(false)
  const [authMode, setAuthMode] = useState(initialRoute.authMode)
  const [screen, setScreen] = useState(initialRoute.screen)
  const [showQuiz, setShowQuiz] = useState(initialRoute.showQuiz)
  const [selectedCourseId, setSelectedCourseId] = useState(initialRoute.selectedCourseId)
  const initialQueryParams = typeof window !== 'undefined' && initialRoute.screen === 'verify-email' ? new URLSearchParams(window.location.search) : null
  const [verificationUserId, setVerificationUserId] = useState(initialRoute.verificationUserId || initialQueryParams?.get('userId') || '')
  const [verificationSecret, setVerificationSecret] = useState(initialRoute.verificationSecret || initialQueryParams?.get('secret') || '')
  const [verificationBusy, setVerificationBusy] = useState(false)
  const [verificationState, setVerificationState] = useState('idle')
  const [statusState, setStatusState] = useState({ key: 'status.syncing' })
  const [adminReport, setAdminReport] = useState(null)
  const [adminStatus, setAdminStatus] = useState(null)
  const [progressReport, setProgressReport] = useState(null)
  const [catalogRows, setCatalogRows] = useState([])
  const [selectedCourseRow, setSelectedCourseRow] = useState(null)
  const t = useMemo(() => createTranslator(locale), [locale])
  const errorMessages = useMemo(() => t('authErrors'), [t])
  const status = t(statusState.key, statusState.params)
  const catalogCourses = useMemo(() => formatCourseCatalog(catalogRows, locale), [catalogRows, locale])
  const courseGroups = useMemo(() => formatCourseGroups(catalogRows, locale), [catalogRows, locale])
  const progressByCourse = useMemo(() => (progressReport?.records || []).reduce((lookup, record) => {
    lookup[record.courseId] = record
    return lookup
  }, {}), [progressReport])
  function isProgressReport(report) { return Array.isArray(report?.records) && typeof report?.summary === 'object' }

  function syncFromHash() { const route = parseRouteHash(window.location.hash); const params = new URLSearchParams(window.location.search); const queryUserId = route.screen === 'verify-email' ? params.get('userId') || '' : ''; const querySecret = route.screen === 'verify-email' ? params.get('secret') || '' : ''; setAuthMode(route.authMode); setScreen(route.screen); setShowQuiz(route.showQuiz); setSelectedCourseId(route.selectedCourseId); setVerificationUserId(route.verificationUserId || queryUserId); setVerificationSecret(route.verificationSecret || querySecret) }
  function navigate(next) { const hash = buildRouteHash(next); const currentHash = window.location.hash.replace(/^#/, ''); if (hash === currentHash) { syncFromHash(); return } window.location.hash = hash }
  function updateStatus(key, params) { setStatusState({ key, params }) }

  useEffect(() => {
    const normalized = normalizeLocale(locale)
    window.localStorage.setItem(LOCALE_STORAGE_KEY, normalized)
    document.documentElement.lang = normalized
  }, [locale])

  useEffect(() => {
    let active = true
    updateStatus('status.restoringSession')
    pingAppwrite().catch(() => {})
    ;(async () => {
      try {
        const account = await getAccount()
        if (!active) return
        setUser(account)
        if (account.emailVerification) {
          await Promise.all([refreshProgress(account), refreshCourses(), refreshAdminAccess()])
          if (!active) return
          updateStatus('status.sessionVerified')
        } else {
          await refreshCourses()
          if (!active) return
          setProgressReport(null)
          setAdminStatus(null)
          updateStatus('status.verifyEmailRequired')
        }
      } catch (_) {
        if (active) updateStatus('status.unlockFlow')
      } finally {
        if (active) setAuthResolved(true)
      }
    })()
    return () => { active = false }
  }, [])

  useEffect(() => { syncFromHash(); const handleHashChange = () => syncFromHash(); window.addEventListener('hashchange', handleHashChange); return () => window.removeEventListener('hashchange', handleHashChange) }, [])

  const selectedCourse = useMemo(() => catalogCourses.find((course) => course.id === selectedCourseId) || null, [catalogCourses, selectedCourseId])
  const nextCourse = useMemo(() => { if (!selectedCourseId) return null; const currentIndex = catalogCourses.findIndex((course) => course.id === selectedCourseId); if (currentIndex === -1) return null; return catalogCourses.slice(currentIndex + 1).find(Boolean) || null }, [catalogCourses, selectedCourseId])
  const selectedCourseDetail = useMemo(() => formatCourseDetail(selectedCourseRow, locale), [locale, selectedCourseRow])
  const adminEnabled = Boolean(adminStatus?.user?.isAdmin) && Boolean(user?.emailVerification)
  const emailVerified = Boolean(user?.emailVerification)
  const currentRoute = useMemo(() => ({ screen, authMode, selectedCourseId, showQuiz, verificationUserId, verificationSecret }), [screen, authMode, selectedCourseId, showQuiz, verificationUserId, verificationSecret])
  const protectedRoutePending = routeNeedsAuth(currentRoute) && !authResolved && !user

  useEffect(() => {
    let active = true
    if (!user || !selectedCourseId || screen !== 'course') {
      setSelectedCourseRow(null)
      return () => { active = false }
    }
    loadLocalCourseRows().then((rows) => {
      if (!active) return
      const localRow = rows.find((course) => course.id === selectedCourseId) || null
      setSelectedCourseRow(localRow)
    })
    getCourseDetail(selectedCourseId, locale)
      .then(() => {
        if (!active) return
      })
      .catch(() => {
        if (!active) return
      })
    return () => { active = false }
  }, [locale, screen, selectedCourseId, user])

  useEffect(() => {
    if (!authResolved) return
    if (!user && routeNeedsAuth(currentRoute)) {
      updateStatus(currentRoute.screen === 'catalog' ? 'status.enterCourses' : 'status.enterCoursePage')
      navigate({ screen: 'auth', authMode: 'login', selectedCourseId: null, showQuiz: false })
      return
    }
    if (user && !emailVerified && routeNeedsVerifiedEmail(currentRoute)) {
      updateStatus('status.verifyEmailRequired')
      navigate({ screen: 'account', authMode: 'login', selectedCourseId: null, showQuiz: false })
      return
    }
    if (routeNeedsAdmin(currentRoute) && user && !adminEnabled) {
      updateStatus('status.notAdmin')
      navigate({ screen: 'home', authMode: 'login', selectedCourseId: null, showQuiz: false })
    }
  }, [authResolved, adminEnabled, currentRoute, emailVerified, user])

  async function refreshProgress(account) {
    if (!account?.$id) {
      setProgressReport(null)
      return null
    }
    try {
      const report = await getProgress(account.$id)
      if (isProgressReport(report)) {
        setProgressReport(report)
        return report
      }
      const fallback = { ok: false, error: 'progress_payload_invalid', records: [], summary: null, raw: report }
      setProgressReport(fallback)
      return null
    } catch (err) {
      setProgressReport({ ok: false, error: err.message || 'progress_load_failed', records: [], summary: null })
      updateStatus('status.progressUnavailable')
      return null
    }
  }

  async function refreshCourses() {
    const localRows = await loadLocalCourseRows()
    setCatalogRows(localRows)
    try {
      await listCourses(locale)
      return localRows
    } catch (_) {
      return localRows
    }
  }

  async function refreshAdminAccess() {
    try {
      const payload = await getAdminStatus()
      setAdminStatus(payload)
      return payload
    } catch (_) {
      setAdminStatus(null)
      return null
    }
  }

  async function activateAccount(account, successKey = 'status.loginSuccess', nextScreen = 'home') {
    setUser(account)
    setAdminReport(null)
    if (account?.emailVerification) {
      await Promise.all([refreshProgress(account), refreshCourses(), refreshAdminAccess()])
      updateStatus(successKey)
      navigate({ screen: nextScreen, authMode: 'login', selectedCourseId: null, showQuiz: false })
    } else {
      setProgressReport(null)
      setAdminStatus(null)
      await refreshCourses()
      updateStatus('status.verifyEmailRequired')
      navigate({ screen: 'account', authMode: 'login', selectedCourseId: null, showQuiz: false })
    }
  }
  async function handleLogin(payload) { setLoadingAuth(true); try { await createEmailSession(payload.email, payload.password); const account = await getAccount(); await activateAccount(account, 'status.loginSuccess') } finally { setLoadingAuth(false) } }
  async function handleSignup(payload) { setLoadingAuth(true); try { await createAccount(payload.email, payload.password, payload.name); await createEmailSession(payload.email, payload.password); const account = await getAccount(); setUser(account); await createEmailVerification(); setProgressReport(null); setAdminReport(null); setAdminStatus(null); await refreshCourses(); updateStatus('status.verificationEmailSent'); navigate({ screen: 'account', authMode: 'login', selectedCourseId: null, showQuiz: false }) } finally { setLoadingAuth(false) } }
  async function handleLogout() { setLoadingAuth(true); try { await deleteSession(); setUser(null); setAdminReport(null); setAdminStatus(null); setProgressReport(null); setCatalogRows([]); setSelectedCourseRow(null); updateStatus('status.sessionClosed'); navigate({ screen: 'home', authMode: 'login', selectedCourseId: null, showQuiz: false }) } finally { setLoadingAuth(false) } }
  async function handleLogoutAll() { setLoadingAuth(true); try { await deleteAllSessions(); setUser(null); setAdminReport(null); setAdminStatus(null); setProgressReport(null); setCatalogRows([]); setSelectedCourseRow(null); updateStatus('status.sessionClosed'); navigate({ screen: 'home', authMode: 'login', selectedCourseId: null, showQuiz: false }) } finally { setLoadingAuth(false) } }
  async function resendVerificationEmail() { await createEmailVerification(); updateStatus('status.verificationEmailSent') }
  async function refreshCurrentAccount() { const account = await getAccount(); await activateAccount(account, account.emailVerification ? 'status.emailVerified' : 'status.verifyEmailRequired', account.emailVerification ? 'catalog' : 'account'); return account }
  function focusAuth(mode) { navigate({ screen: 'auth', authMode: mode, selectedCourseId: null, showQuiz: false }) }
  function requireVerifiedAccess(statusKey) { if (!user) { updateStatus(statusKey); return false } if (!emailVerified) { updateStatus('status.verifyEmailRequired'); navigate({ screen: 'account', authMode: 'login', selectedCourseId: null, showQuiz: false }); return false } return true }
  function openCatalog() { if (!requireVerifiedAccess('status.enterCourses')) return; navigate({ screen: 'catalog', authMode, selectedCourseId: null, showQuiz: false }) }
  function openCourse(courseId) { if (!requireVerifiedAccess('status.enterCoursePage')) return; navigate({ screen: 'course', authMode, selectedCourseId: courseId, showQuiz: false }) }
  function openAccount() { if (!user) { updateStatus('status.enterCourses'); return } navigate({ screen: 'account', authMode, selectedCourseId: null, showQuiz: false }) }
  function openAdmin() { if (!requireVerifiedAccess('status.verifyEmailRequired')) return; if (!adminEnabled) { updateStatus('status.notAdmin'); return } navigate({ screen: 'admin', authMode, selectedCourseId: null, showQuiz: false }) }
  async function handleUpdateProfile(payload) {
    const account = await updateAccountName(payload.name || user?.name || user?.email || 'MGenética learner')
    setUser(account)
    updateStatus('status.profileSaved')
    return account
  }
  async function persistQuizResult(courseId, answers) {
    const rawReport = await updateProgress(courseId, answers)
    const report = isProgressReport(rawReport) ? rawReport : await refreshProgress(user)
    if (report) setProgressReport(report)
    updateStatus('status.progressSaved')
    return report || rawReport
  }
  useEffect(() => {
    if (screen !== 'verify-email') return
    if (!verificationUserId || !verificationSecret) {
      setVerificationState('missing')
      updateStatus('status.verificationMissing')
      return
    }
    let active = true
    setVerificationState('processing')
    setVerificationBusy(true)
    updateStatus('status.verifyingEmail')
    ;(async () => {
      try {
        await completeEmailVerification(verificationUserId, verificationSecret)
        if (!active) return
        setVerificationState('success')
        updateStatus('status.emailVerified')
        try {
          const account = await getAccount()
          if (!active) return
          await activateAccount(account, 'status.emailVerified', 'catalog')
        } catch (_) {
          if (!active) return
          setUser(null)
          setAdminStatus(null)
          setProgressReport(null)
          navigate({ screen: 'auth', authMode: 'login', selectedCourseId: null, showQuiz: false })
        }
      } catch (err) {
        if (active) {
          setVerificationState('failed')
          updateStatus('status.verificationFailed')
        }
      } finally {
        if (active) setVerificationBusy(false)
      }
    })()
    return () => { active = false }
  }, [screen, verificationUserId, verificationSecret])

  async function runAdminChecks() {
    setLoadingAdmin(true)
    updateStatus('status.runningChecks')
    try {
      const results = await Promise.all([
        pingAppwrite().then(() => ({ ok: true })).catch((err) => ({ ok: false, error: err.message })),
        getAuthCapabilities().catch((err) => ({ ok: false, error: err.message })),
        listCourses(locale).catch((err) => ({ ok: false, error: err.message })),
        getProgress(user?.$id || user?.email || 'anonymous').catch((err) => ({ ok: false, error: err.message })),
        getAdminStatus().catch((err) => ({ ok: false, error: err.message })),
        getAdminSummary().catch((err) => ({ ok: false, error: err.message }))
      ])
      setAdminReport({ checkedAt: new Date().toISOString(), ping: results[0], auth: results[1], courses: results[2], progress: results[3], admin: results[4], summary: results[5], user: user ? { id: user.$id, email: user.email || null, name: user.name || null } : null })
      updateStatus('status.checksDone')
    } catch (err) {
      setAdminReport({ checkedAt: new Date().toISOString(), fatal: err.message || 'Failed to run checks.' })
      updateStatus('status.checksFailed')
    } finally { setLoadingAdmin(false) }
  }
  function goHome() { navigate({ screen: 'home', authMode: 'login', selectedCourseId: null, showQuiz: false }) }

  if (protectedRoutePending) {
    return <AuthPage user={null} status={status} authMode="login" loadingAuth={true} isAdmin={false} onAuthIntent={focusAuth} onLogin={handleLogin} onSignup={handleSignup} onLogout={handleLogout} onOpenCatalog={openCatalog} onOpenAccount={openAccount} onOpenAdmin={openAdmin} locale={locale} onLocaleChange={setLocale} t={t} errorMessages={errorMessages} />
  }
  if (screen === 'verify-email') {
    return <VerificationPage route={currentRoute} user={user} status={status} loading={verificationBusy} state={verificationState} onBack={goHome} onOpenAccount={openAccount} onAuthIntent={focusAuth} onLogout={handleLogout} locale={locale} onLocaleChange={setLocale} t={t} />
  }
  if (showQuiz && user && emailVerified && selectedCourse) {
    return (
      <Suspense fallback={<LoadingScreen t={t} />}>
        <Quiz courseId={selectedCourseId} courseTitle={selectedCourse?.title || ''} locale={locale} onBack={() => navigate({ screen: 'course', authMode, selectedCourseId, showQuiz: false })} onPersistResult={(result) => persistQuizResult(selectedCourseId, result)} t={t} />
      </Suspense>
    )
  }
  if (screen === 'course' && user && emailVerified && selectedCourse) {
    return (
      <Suspense fallback={<LoadingScreen t={t} />}>
        <CoursePage course={selectedCourse} detail={selectedCourseDetail} progress={progressByCourse[selectedCourse.id] || null} onBack={() => navigate({ screen: 'catalog', authMode, selectedCourseId: null, showQuiz: false })} onOpenQuiz={() => navigate({ screen: 'course', authMode, selectedCourseId, showQuiz: true })} onOpenCatalog={openCatalog} onOpenCourse={openCourse} nextCourse={nextCourse} onLogout={handleLogout} loadingAuth={loadingAuth} locale={locale} onLocaleChange={setLocale} t={t} />
      </Suspense>
    )
  }
  if (screen === 'catalog' && user && emailVerified) {
    return <CatalogPage courseGroups={courseGroups} progressByCourse={progressByCourse} progressSummary={progressReport?.summary} isAdmin={adminEnabled} onBack={goHome} onOpenCourse={openCourse} onOpenAccount={openAccount} onOpenAdmin={openAdmin} onLogout={handleLogout} loadingAuth={loadingAuth} locale={locale} onLocaleChange={setLocale} t={t} />
  }
  if (screen === 'account' && user) {
    return <AccountPage user={user} courses={catalogCourses} progressByCourse={progressByCourse} progressSummary={progressReport?.summary} isAdmin={adminEnabled} onBack={goHome} onOpenCatalog={openCatalog} onOpenCourse={openCourse} onOpenAdmin={openAdmin} onLogout={handleLogout} onLogoutAll={handleLogoutAll} onUpdateProfile={handleUpdateProfile} onResendVerification={resendVerificationEmail} onRefreshUser={refreshCurrentAccount} loadingAuth={loadingAuth} locale={locale} onLocaleChange={setLocale} t={t} />
  }
  if (screen === 'admin' && user && adminEnabled) {
    return <AdminPage user={user} status={status} report={adminReport} loading={loadingAdmin} onRefresh={runAdminChecks} onBack={goHome} onLogout={handleLogout} loadingAuth={loadingAuth} locale={locale} onLocaleChange={setLocale} t={t} />
  }
  if (screen === 'auth') {
    return <AuthPage user={user} status={status} authMode={authMode} loadingAuth={loadingAuth} isAdmin={adminEnabled} onAuthIntent={focusAuth} onLogin={handleLogin} onSignup={handleSignup} onLogout={handleLogout} onOpenCatalog={openCatalog} onOpenAccount={openAccount} onOpenAdmin={openAdmin} locale={locale} onLocaleChange={setLocale} t={t} errorMessages={errorMessages} />
  }
  return <HomePage user={user} status={status} loadingAuth={loadingAuth} isAdmin={adminEnabled} onAuthIntent={focusAuth} onLogout={handleLogout} onOpenCatalog={openCatalog} onOpenAccount={openAccount} onOpenAdmin={openAdmin} locale={locale} onLocaleChange={setLocale} t={t} />
}
