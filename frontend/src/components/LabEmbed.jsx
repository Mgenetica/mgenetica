import React, { useEffect, useRef, useState } from 'react'

const MIN_HEIGHT = 620
const MAX_HEIGHT = 1600

function normalizeLabSrc(lab) {
  const raw = String(lab || '').trim()
  if (!/^\/labs\/M\d{2}_[A-Za-z0-9_-]+\.html$/.test(raw)) return null
  const base = import.meta.env.BASE_URL || '/'
  return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`
}

export default function LabEmbed({ lab, title, locale = 'pt-BR' }) {
  const frameRef = useRef(null)
  const [height, setHeight] = useState(820)
  const [initialLocale] = useState(locale)
  const baseSrc = normalizeLabSrc(lab)
  const src = baseSrc ? `${baseSrc}?lang=${encodeURIComponent(initialLocale)}` : null

  function sendLocale() {
    // Sandboxed labs have an opaque origin; the receiver validates event.source.
    frameRef.current?.contentWindow?.postMessage({ type: 'mg-set-lang', lang: locale }, '*')
  }

  useEffect(() => {
    sendLocale()
  }, [locale])

  useEffect(() => {
    setHeight(820)
  }, [src])

  useEffect(() => {
    function handleMessage(event) {
      if (event.source !== frameRef.current?.contentWindow) return
      const data = event.data
      if (!data || data.type !== 'mg-lab-height') return
      const nextHeight = Math.ceil(Number(data.height))
      if (!Number.isFinite(nextHeight)) return
      setHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, nextHeight)))
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  if (!src) return null

  return (
    <iframe
      ref={frameRef}
      className="course-lab-frame"
      src={src}
      title={title}
      loading="lazy"
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      onLoad={sendLocale}
      style={{ '--course-lab-height': `${height}px` }}
    />
  )
}

export { normalizeLabSrc }
