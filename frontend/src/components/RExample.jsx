import React, { useEffect, useRef, useState } from 'react'

const copy = {
 'pt-BR': ['Executar R', 'Reiniciar R', 'Restaurar exemplo', 'Código R', 'Resultado', 'Carregando R…', 'Executando…', 'Edite o exemplo e execute no navegador. A primeira execução baixa o ambiente R.', 'Concluído', 'Não foi possível executar. Confira o código ou reinicie R.', 'Gráfico produzido pelo exemplo R', 'O ambiente R não iniciou. Seu código ainda não foi executado.'],
 en: ['Run R', 'Restart R', 'Restore example', 'R code', 'Output', 'Loading R…', 'Running…', 'Edit the example and run it in your browser. The first run downloads the R environment.', 'Completed', 'Could not run. Check the code or restart R.', 'Plot produced by the R example', 'The R environment did not start. Your code has not run yet.'],
 es: ['Ejecutar R', 'Reiniciar R', 'Restaurar ejemplo', 'Código R', 'Resultado', 'Cargando R…', 'Ejecutando…', 'Edite el ejemplo y ejecútelo en el navegador. La primera ejecución descarga el entorno R.', 'Completado', 'No se pudo ejecutar. Revise el código o reinicie R.', 'Gráfico producido por el ejemplo R', 'El entorno R no se inició. Su código todavía no se ha ejecutado.']
}
export default function RExample({ code, locale = 'pt-BR' }) {
 const c = copy[locale] || copy['pt-BR']
 const [source, setSource] = useState(code)
 const [state, setState] = useState('idle')
 const [output, setOutput] = useState('')
 const [plots, setPlots] = useState([])
 const runtime = useRef(null)
 const generation = useRef(0)
 const canvases = useRef([])
 function restart() {
  generation.current++
  runtime.current?.close()
  runtime.current = null
  setState('idle'); setOutput(''); setPlots([])
 }
 useEffect(() => () => { generation.current++; runtime.current?.close() }, [])
 useEffect(() => {
  plots.forEach((plot, i) => {
   const canvas = canvases.current[i]
   if (canvas) { canvas.width = plot.width; canvas.height = plot.height; canvas.getContext('2d').drawImage(plot, 0, 0) }
   plot.close?.()
  })
 }, [plots])
 async function run() {
  const ticket = ++generation.current
  let shelter
  let initialized = false
  try {
   setOutput(''); setPlots([])
   if (!runtime.current) {
    setState('loading')
    const url = 'https://webr.r-wasm.org/v0.5.4/webr.mjs'
    const { WebR, ChannelType } = await import(/* @vite-ignore */ url)
    if (ticket !== generation.current) return
    runtime.current = new WebR({ channelType: ChannelType.PostMessage })
    const engine = runtime.current
    let timer
    try {
     await Promise.race([engine.init(), new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('R initialization timed out.')), 45000)
     })])
    } catch (error) {
     engine.close(); if (runtime.current === engine) runtime.current = null
     throw error
    } finally { clearTimeout(timer) }
   }
   if (ticket !== generation.current) return
   initialized = true
   setState('running')
   shelter = await new runtime.current.Shelter()
   const result = await shelter.captureR(source, { withAutoprint: true, captureGraphics: true })
   if (ticket !== generation.current) { result.images.forEach(p => p.close?.()); return }
   setOutput(result.output.map(line => line.data).join('\n'))
   setPlots(result.images)
   setState(result.output.some(line => line.type === 'error') ? 'error' : 'done')
  } catch (error) {
   if (ticket === generation.current) { setState('error'); setOutput(`${c[initialized ? 9 : 11]}\n${error.message}`) }
  } finally { if (ticket === generation.current) await shelter?.purge() }
 }
 const busy = state === 'loading' || state === 'running'
 return <div className="r-example">
  <p className="r-example-note">{c[7]}</p>
  <label>{c[3]}<textarea spellCheck={false} value={source} onChange={e => setSource(e.target.value)} disabled={busy} /></label>
  <div className="r-example-actions"><button type="button" onClick={run} disabled={busy}>{c[0]}</button><button type="button" onClick={restart}>{c[1]}</button><button type="button" disabled={busy} onClick={() => setSource(code)}>{c[2]}</button></div>
  <p role="status">{busy ? c[state === 'loading' ? 5 : 6] : state === 'done' ? c[8] : ''}</p>
  {output && <div><strong>{c[4]}</strong><pre className="r-example-output">{output}</pre></div>}
  {plots.map((_, i) => <canvas key={i} ref={node => { canvases.current[i] = node }} role="img" aria-label={c[10]} />)}
 </div>
}
