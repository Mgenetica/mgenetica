import React, { useState } from 'react'

// Public assets resolve correctly on both the custom domain and project previews.
export const coverUrl = src => src?.startsWith('https://') ? src : `${import.meta.env.BASE_URL}${(src || '').replace(/^\//, '')}`
export default function BlogCover({ cover, title, hero = false }) {
  const [failedSrc, setFailedSrc] = useState(null)
  const visible = cover?.src && failedSrc !== cover.src
  return <figure className={`blog-cover ${hero ? 'blog-cover-hero' : ''}`}>
    {visible ? <img src={coverUrl(cover.src)} alt={hero ? cover.alt || title : ''}
      width={cover.width || 1600} height={cover.height || 900}
      loading={hero ? 'eager' : 'lazy'} decoding="async"
      style={{ objectPosition: cover.position || 'center' }} onError={() => setFailedSrc(cover.src)} />
      : <div className="blog-cover-placeholder" aria-hidden="true"><span>MG</span><i /><i /><i /></div>}
    {hero && visible && (cover.caption || cover.credit) && <figcaption>{cover.caption}{cover.caption && cover.credit ? ' · ' : ''}{cover.credit}</figcaption>}
  </figure>
}
