export function parsePlainText(md){
  const lines=md.split(/\n+/).map(l=>l.trim());
  const isJunk=l=>!l||
    /^(Title:?|URL|URL Source|Source|Published|Markdown|Submit|Common Searches:|Make a Contribution|Online Bookstore|Daily Reflections?\b|Daily Reflection\b|\[Skip|\[Search|Search\s+\[x\]|=+$|-+$)/i.test(l)||
    /alcoholics anonymous|aa grapevine|A\.A\. World Services|View archive|Plain text via|Super Navigation|Find A\.A\.|Contribution|Bookstore|Mega Menu|Select your language|(?:[*•]\s*)?Left\s*[*•]\s*Right(?:\s*[*•])?/i.test(l)||
    /\[[^\]]+\]/.test(l)||
    /^\[[^\]]+\]\([^)]*\)(\s+\[[^\]]+\]\([^)]*\))*$/.test(l)||
    l.startsWith('javascript:void');
  const clean=lines.filter(l=>!isJunk(l));
  let title='Daily Reflection';
  if(clean[0]?.startsWith('###'))      title=clean.shift().replace(/^###\s*/,'').trim();
  else if(/^[A-Z][A-Z0-9\s,'-]+$/.test(clean[0])) title=clean.shift();
  const body=[];
  for(const l of clean){
    if(l.startsWith('###')) break;
    if(l) body.push(l);
    if(body.length>=2) break;
  }
  return {title, body:body.join(' ').trim()};
}

export function parseDailyHtml(html){
  const strip=t=>t.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
  html=html.replace(/<script[^>]*>[\s\S]*?<\/script>|<style[^>]*>[\s\S]*?<\/style>/gi,'');
  const main=html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1]||'';
  const h=main.match(/<(h1|h2)[^>]*>([\s\S]*?)<\/\1>/i);
  const title=h?strip(h[2]):'Daily Reflection';
  let rest=main.slice(h?main.indexOf(h[0])+h[0].length:0).trimStart();
  const ps=[];
  const pRe=/<p[^>]*>([\s\S]*?)<\/p>/ig;
  let m,last=0;
  while((m=pRe.exec(rest))){
    if(m.index>last && /[^\s]/.test(rest.slice(last,m.index))) break;
    ps.push(strip(m[1]));
    last=pRe.lastIndex;
  }
  const body=ps.join(' ').trim();
  const res=parsePlainText(`### ${title}\n${body}`);
  return res.body?res:{title,body};
}

export function parseDailyRss(xml){
  const item=xml.match(/<item>([\s\S]*?)<\/item>/i)?.[1]||'';
  const t=item.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim()||'Daily Reflection';
  const desc=item.match(/<description>([\s\S]*?)<\/description>/i)?.[1]||'';
  const clean=desc
    .replace(/<!\[CDATA\[|\]\]>/g,'')
    .replace(/<\/?p[^>]*>/gi,'\n')
    .replace(/<[^>]*>/g,'');
  const title=t.replace(/<[^>]*>/g,'').trim();
  const res=parsePlainText(`### ${title}\n${clean}`);
  return res.body?res:{title,body:res.body?res.body.trim():''};
}

function sha1(str){
  const utf8=new TextEncoder().encode(str);
  const words=[];for(let i=0;i<utf8.length;i++)
    words[i>>2]|=utf8[i]<<((3-(i%4))<<3);
  words[utf8.length>>2]|=0x80<<((3-(utf8.length%4))<<3);
  words[((utf8.length+8>>6)<<4)+15]=utf8.length<<3;
  let h0=0x67452301,h1=0xefcdab89,h2=0x98badcfe,h3=0x10325476,h4=0xc3d2e1f0;
  for(let i=0;i<words.length;i+=16){
    const w=words.slice(i,i+16);
    for(let t=16;t<80;t++) w[t]=rotl(w[t-3]^w[t-8]^w[t-14]^w[t-16],1);
    let a=h0,b=h1,c=h2,d=h3,e=h4;
    for(let t=0;t<80;t++){
      const s=t>>5;
      const f=s===0?((b&c)|(~b&d)):s===1?(b^c^d):s===2?((b&c)|(b&d)|(c&d)):(b^c^d);
      const k=[0x5a827999,0x6ed9eba1,0x8f1bbcdc,0xca62c1d6][s];
      const temp=(rotl(a,5)+f+e+k+w[t])>>>0;
      e=d;d=c;c=rotl(b,30);b=a;a=temp;
    }
    h0=(h0+a)>>>0;h1=(h1+b)>>>0;h2=(h2+c)>>>0;h3=(h3+d)>>>0;h4=(h4+e)>>>0;
  }
  return [h0,h1,h2,h3,h4].map(x=>('00000000'+x.toString(16)).slice(-8)).join('');
}
function rotl(n,b){return(n<<b)|(n>>>32-b);} 

export function parseJinaText(raw){
  raw=raw.replace(/\r/g,'');
  const lines=raw.split('\n');
  let i=0;
  const out={title:'Daily Reflection',date:'',quotes:[],body:''};
  while(i<lines.length && !/^###\s+/.test(lines[i].trim())) i++;
  if(i<lines.length){
    out.title=lines[i].trim().replace(/^###\s*/,'').replace(/^"|"$/g,'').trim();
    i++;
  }
  while(i<lines.length && !lines[i].trim()) i++;
  if(i<lines.length){out.date=lines[i].trim();i++;}
  const rawQuotes=[];
  while(i<lines.length && rawQuotes.length<12){
    const t=lines[i].trim();
    if(!t || !t.startsWith('**')) break;
    rawQuotes.push(t);
    i++;
    if(i<lines.length && !lines[i].trim()) break;
  }
  const quoteCandidates=[],bodyPrepend=[],qMap=new Map(),bMap=new Map();
  const hashList=[];
  for(const t of rawQuotes){
    let q=t.replace(/^\*+|\*+$/g,'').trim();
    q=q.replace(/^['"“”‘’]+|['"“”‘’]+$/g,'').trim();
    q=q.replace(/\s+/g,' ');
    const canon=q.toLowerCase().replace(/[^a-z0-9.\s]/gi,'').trim();
    const h=sha1(canon);
    if(!q) continue;
    if(q.length>160){
      if(!bMap.has(h)){bMap.set(h,true);bodyPrepend.push(q);hashList.push(h);}
    }else{
      if(!qMap.has(h)){qMap.set(h,true);quoteCandidates.push(q);hashList.push(h);}
    }
  }
  const quotes=quoteCandidates.slice(0,2);
  console.debug('[DR] uniqueQuoteHashes', hashList);
  console.debug('[DR] quotes:', quotes);
  console.debug('[DR] bodyPrepend:', bodyPrepend);
  out.quotes=quotes;
  const foot=[/^\*\s+Left/i,/^\*\s+Right/i,/Plain text via/i,/Make a Contribution/i,/Online Bookstore/i,/Select your language/i];
  const paras=[]; let p=[];
  for(;i<lines.length;i++){
    const line=lines[i]; const t=line.trim();
    if(t===''){if(p.length){paras.push(p.join(' '));p=[];} continue;}
    if(t.startsWith('[')||foot.some(re=>re.test(t))) break;
    p.push(t);
  }
  if(p.length) paras.push(p.join(' '));
  if(bodyPrepend.length) paras.unshift(...bodyPrepend);
  out.body=paras.join('\n\n').trim();
  return out;
}
