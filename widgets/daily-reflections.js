// Daily Reflections widget logic
import {parsePlainText} from './daily-reflections-lib.js';
const FEED='https://www.aa.org/sites/default/files/feed-en-aaregroom-calendar.xml';
const PAGE='https://www.aa.org/daily-reflections';
const prox1=u=>'https://api.allorigins.win/raw?url='+encodeURIComponent(u);
const prox2=u=>'https://r.jina.ai/http://'+u.replace(/^https?:\/\//,'');

const card=document.getElementById('card');
function render(t,txt,src){
  card.innerHTML=`<h2>${t}</h2><p>${txt}</p>`+
  `<small>${src} via A.A. World Services • `+
  `<a href="https://www.aa.org/daily-reflections" target="_blank" style="color:var(--fern);text-decoration:none">View archive</a></small>`;
}

function parsePlain(md){
  const {title,body}=parsePlainText(md);
  if(body) render(title,body,'Plain text');
  else throw 0;
}

function parseHtml(html,src){
  if(!html.trim().startsWith('<')) throw 0;
  const doc=new DOMParser().parseFromString(html,'text/html');
  const h=doc.querySelector('main h1,h2,h3');
  let body='',n=h?.nextElementSibling;
  while(n&&n.tagName==='P'){body+=n.textContent.trim()+' ';n=n.nextElementSibling;}
  body=body.trim();
  if(body) render(h?h.textContent.trim():'Daily Reflection',body,src); else throw 0;
}

function scrape(){
  fetch(prox1(PAGE),{cache:'no-store'})
    .then(r=>r.ok?r.text():Promise.reject())
    .then(h=>parseHtml(h,'HTML via AllOrigins'))
    .catch(()=>fetch(prox2(PAGE),{cache:'no-store'})
      .then(r=>r.ok?r.text():Promise.reject())
      .then(t=>parsePlain(t))
      .catch(()=>render('Daily Reflection','Sorry — unable to load today\u2019s reading.','Error')));
}

fetch(prox1(FEED),{cache:'no-store'}).then(r=>r.ok?r.text():Promise.reject())
.then(xml=>{
  const d=new DOMParser().parseFromString(xml,'text/xml');
  const i=d.querySelector('item');
  const title=i?.querySelector('title')?.textContent.trim();
  const body=i?.querySelector('description')?.textContent?.replace(/<[^>]+>/g,'').trim();
  if(title&&body) return render(title,body,'RSS');
  throw 0;
}).catch(()=>scrape());
