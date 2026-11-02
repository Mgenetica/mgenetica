import whiteMarkings from './white-markings.json' with { type: 'json' }
import temperaturePerformance from './temperature-performance.json' with { type: 'json' }
import entries from './entries.generated.json' with { type: 'json' }
import { searchPosts, visiblePosts } from './catalog.mjs'
export const allPosts = [whiteMarkings,temperaturePerformance,...entries]
export const posts = visiblePosts(allPosts,{drafts: entries.some(p=>p.status==='draft')})
export const filterPosts = (query='',category='Todos',list=posts) => searchPosts(list,query,category)
