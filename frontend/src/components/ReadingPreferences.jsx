import React, { useEffect, useState } from 'react'
export default function ReadingPreferences() {
 const [large,setLarge]=useState(false)
 useEffect(()=>{try{setLarge(localStorage.getItem('mgenetica-large-text')==='true')}catch{}},[])
 useEffect(()=>{document.documentElement.classList.toggle('blog-large-text',large);return()=>document.documentElement.classList.remove('blog-large-text')},[large])
 function toggle(){const next=!large;setLarge(next);try{localStorage.setItem('mgenetica-large-text',String(next))}catch{}}
 return <button type="button" className="editorial-text-button" aria-pressed={large} onClick={toggle}>{large?'Restaurar tamanho do texto':'Aumentar texto'}</button>
}
