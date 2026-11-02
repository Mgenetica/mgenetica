import React, { useState } from 'react'

export default function ArticleActions() {
  const [status, setStatus] = useState('')
  const [link, setLink] = useState('')
  async function copyLink() {
    const url = new URL(window.location.href)
    url.hash = ''
    try {
      await navigator.clipboard.writeText(url.href)
      setLink('')
      setStatus('Link copiado. Agora você pode compartilhar este artigo.')
    } catch {
      setLink(url.href)
      setStatus('Selecione e copie o endereço abaixo.')
    }
  }
  return <div className="article-actions">
    <button type="button" className="editorial-button editorial-button-secondary" onClick={copyLink}>Copiar link do artigo</button>
    <button type="button" className="editorial-text-button" onClick={() => window.print()}>Imprimir ou salvar PDF</button>
    <span role="status">{status}</span>
    {link && <label>Endereço do artigo<input readOnly value={link} onFocus={event => event.target.select()} /></label>}
  </div>
}
