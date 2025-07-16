// Daily Reflections widget logic
import {parsePlainText, parseDailyRss} from './daily-reflections-lib.js';
const FEED='https://www.aa.org/sites/default/files/DailyReflections.xml';
const PAGE='https://www.aa.org/daily-reflections';
const prox1=u=>'https://api.allorigins.win/raw?url='+encodeURIComponent(u);
const prox2=u=>'https://r.jina.ai/http://'+u.replace(/^https?:\/\//,'');

const card=document.getElementById('card');
function render(t,txt){
  card.innerHTML=`<h2>${t}</h2><p>${txt}</p>`;
}

function parsePlain(md){
  const {title,body}=parsePlainText(md);
  if(body) render(title,body);
  else throw 0;
}

function scrape(){
  fetch(prox2(PAGE),{cache:'no-store'})
    .then(r=>r.ok?r.text():Promise.reject())
    .then(t=>parsePlain(t))
    .catch(()=>render('Daily Reflection','Sorry — unable to load today\u2019s reading.'));
}

fetch(prox1(FEED),{cache:'no-store'})
  .then(r=>r.ok?r.text():Promise.reject())
  .then(xml=>{
    const {title,body}=parseDailyRss(xml);
    if(body) return render(title,body);
    throw 0;
  })
  .catch(()=>scrape());
