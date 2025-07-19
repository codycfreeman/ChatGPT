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

function sha256(ascii){
  const rightRotate=(n,x)=>n>>>x|n<<32-x;
  const max=2**32;let i,j,T1,T2;
  const H=[1779033703,-1150833019,1013904242,-1521486534,1359893119,-1694144372,528734635,1541459225];
  const K=[];for(i=0;i<64;)K[i]=((Math.abs(Math.sin(++i))*max)|0);
  const bytes=[];for(i=0;i<ascii.length;i++)bytes.push(ascii.charCodeAt(i));
  bytes.push(128);while(bytes.length%64-56)bytes.push(0);
  const l=ascii.length*8;bytes.push(0,0,0,0,l>>>24,l>>>16&255,l>>>8&255,l&255);
  const w=new Uint32Array(64);
  for(i=0;i<bytes.length;){
    for(j=0;j<16;j++,i+=4)w[j]=bytes[i]<<24|bytes[i+1]<<16|bytes[i+2]<<8|bytes[i+3];
    for(j=16;j<64;j++){
      const s0=rightRotate(w[j-15],7)^rightRotate(w[j-15],18)^w[j-15]>>>3;
      const s1=rightRotate(w[j-2],17)^rightRotate(w[j-2],19)^w[j-2]>>>10;
      w[j]=(w[j-16]+s0+w[j-7]+s1)|0;
    }
    let a=H[0],b=H[1],c=H[2],d=H[3],e=H[4],f=H[5],g=H[6],h=H[7];
    for(j=0;j<64;j++){
      const S1=rightRotate(e,6)^rightRotate(e,11)^rightRotate(e,25);
      const ch=(e&f)^~e&g;T1=h+S1+ch+K[j]+w[j]|0;
      const S0=rightRotate(a,2)^rightRotate(a,13)^rightRotate(a,22);
      const maj=(a&b)^(a&c)^(b&c);T2=S0+maj|0;
      h=g;g=f;f=e;e=d+T1|0;d=c;c=b;b=a;a=T1+T2|0;
    }
    H[0]=H[0]+a|0;H[1]=H[1]+b|0;H[2]=H[2]+c|0;H[3]=H[3]+d|0;
    H[4]=H[4]+e|0;H[5]=H[5]+f|0;H[6]=H[6]+g|0;H[7]=H[7]+h|0;
  }
  return H.map(n=>('00000000'+(n>>>0).toString(16)).slice(-8)).join('');
}

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
  const quotes=dedupeQuotes(quoteCandidates);
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

// Final safeguard: dedupe quotes right before rendering so any
// downstream logic can never surface duplicates.
// Final safeguard: dedupe quote lines globally so duplicates can never appear.
export function dedupeQuotes(rawQuotes = []){
  const canonical=str=>str.toLowerCase().trim().replace(/\s+/g,' ').replace(/[^a-z0-9.\s]/gi,'');
  const seen=new Set();
  const uniq=[];
  for(const line of rawQuotes){
    const h=sha256(canonical(line));
    if(!seen.has(h)){seen.add(h);uniq.push(line);}
  }
  return uniq.slice(0,2);
}

export function buildBlockquote(rawQuotes = []){
  const uniq=dedupeQuotes(rawQuotes);
  const seen=new Set(uniq.map(q=>sha256(q.toLowerCase().trim().replace(/\s+/g,' ').replace(/[^a-z0-9.\s]/gi,''))));
  if(uniq.length>2||seen.size!==uniq.length) throw new Error('Quote dedupe failed');
  if (!uniq.length) return '';
  console.debug('[DR] postRender quotes', uniq);
  if (uniq.length === 1) return `<blockquote><p class="dr-quote">${uniq[0]}</p></blockquote>`;
  if (uniq.length >= 2) return `<blockquote><p class="dr-quote">${uniq[0]}</p><p class="dr-quote-src">${uniq[1]}</p></blockquote>`;
  return '';
}
buildBlockquote.dedupe = dedupeQuotes;
