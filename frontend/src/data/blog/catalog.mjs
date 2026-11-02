export const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
export function articleText(post) {
  return [post.title,post.summary,post.category,...(post.tags||[]),...(post.introduction||[]).map(b=>b.text),...post.sections.flatMap(s=>[s.title,...(s.paragraphs||[]),...(s.blocks||[]).map(b=>b.text)])].join(' ')
}
export function searchPosts(posts,query='',category='Todos') {
 const terms=normalize(query).trim().split(/\s+/).filter(Boolean)
 return posts.filter(p=>(category==='Todos'||p.category===category)&&terms.every(term=>normalize(articleText(p)).includes(term)))
}
export function visiblePosts(posts,{drafts=false,now=new Date()}={}) {
 return posts.filter(p=>(p.status==='published'||!p.status||(drafts&&p.status==='draft'))&&(drafts||new Date(p.date+'T00:00:00Z')<=now)).sort((a,b)=>b.date.localeCompare(a.date))
}
