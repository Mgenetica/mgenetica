import React from 'react'
import { createRoot } from 'react-dom/client'
import PublicSite from './PublicSite'
import CoursePreview from './CoursePreview'
import './styles.css'

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <main className="app-shell">
          <section className="content-section">
            <div className="callout-warning" role="alert">
              <strong>Application error:</strong> Refresh the page. If this message remains, the learning app could not start.
            </div>
          </section>
        </main>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootErrorBoundary>
      {import.meta.env.DEV && new URLSearchParams(window.location.search).has('course-preview') ? <CoursePreview /> : <PublicSite />}
    </RootErrorBoundary>
  </React.StrictMode>
)
