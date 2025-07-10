export function parsePlainText(md){
  const lines=md.split(/\n+/).map(l=>l.trim());
  const isJunk=l=>!l||
    /^(Title:?|URL|URL Source|Source|Published|Markdown|Submit|Common Searches:|Daily Reflections?\b|Daily Reflection\b|\[Skip|\[Search|Search\s+\[x\]|=+$|-+$)/i.test(l)||
    /alcoholics anonymous|aa grapevine|A\.A\. World Services|View archive|Plain text via/i.test(l)||
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