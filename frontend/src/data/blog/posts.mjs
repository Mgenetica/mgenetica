import temperaturePerformance from './temperature-performance.json' with { type: 'json' }
export const posts = [temperaturePerformance]
export function filterPosts(query = '', category = 'Todos') {
  const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const needle = normalize(query.trim())
  return posts.filter(p => (category === 'Todos' || p.category === category) && normalize(`${p.title} ${p.summary} ${p.category}`).includes(needle))
}
