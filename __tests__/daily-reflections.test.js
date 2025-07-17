import {parsePlainText, parseDailyHtml, parseDailyRss, parseJinaText} from '../widgets/daily-reflections-lib.js';
import fs from 'fs';

const sample1=`Daily Reflections | Alcoholics Anonymous
[Skip to main content]
Search [x]
### FELLOWSHIP IS THE ANSWER
First paragraph of wisdom.
Second paragraph continues.
URL Source: https://www.aa.org/daily-reflections
Source\n`;

test('cleans jina ai text with markdown heading',()=>{
  const {title,body}=parsePlainText(sample1);
  expect(title).toBe('FELLOWSHIP IS THE ANSWER');
  expect(body).toBe('First paragraph of wisdom. Second paragraph continues.');
});

const sample2=`Daily Reflections | Alcoholics Anonymous\nHUMILITY IS THE KEY\nSome text here.\nMore insight.\nPublished 2024/07/09`;

test('cleans jina ai text with all-caps title',()=>{
  const {title,body}=parsePlainText(sample2);
  expect(title).toBe('HUMILITY IS THE KEY');
  expect(body).toBe('Some text here. More insight.');
});

const sample3=`Daily Reflection\nSubmit Common Searches:\n\nPlain text via A.A. World Services \u2022 View archive`;

const sample4=fs.readFileSync(new URL('../tests/sample-plain.txt', import.meta.url), 'utf8');

const sample5=`Daily Reflection\n[Skip to main content]\nSuper Navigation * Find Help\n\nPlain text via A.A. World Services \u2022 View archive`;
const sample6=fs.readFileSync(new URL('../tests/fixtures/fail-megamenu.txt', import.meta.url),'utf8');
const sample7=fs.readFileSync(new URL('../tests/fixtures/fail-left-right.txt', import.meta.url),'utf8');

const jina1=fs.readFileSync(new URL('../tests/__fixtures__/sample-jina.txt', import.meta.url),'utf8');
const jina2=fs.readFileSync(new URL('../tests/__fixtures__/sample-jina-footer.txt', import.meta.url),'utf8');
const jinaDup=fs.readFileSync(new URL('../tests/fixtures/dup-quotes-jina.txt', import.meta.url),'utf8');
const dupQuote=fs.readFileSync(new URL('../tests/fixtures/dup-quote.txt', import.meta.url),'utf8');
const dupQuoteRaw=fs.readFileSync(new URL('../tests/fixtures/dup-quote-raw.txt', import.meta.url),'utf8');
const dupQuoteVariant=fs.readFileSync(new URL('../tests/fixtures/dup-quote-variant.txt', import.meta.url),'utf8');
const dupQuoteLong=fs.readFileSync(new URL('../tests/fixtures/dup-quote-long.txt', import.meta.url),'utf8');
const liveDupCluster=fs.readFileSync(new URL('../tests/fixtures/live-dup-cluster.txt', import.meta.url),'utf8');
const liveDupVariant=fs.readFileSync(new URL('../tests/fixtures/live-dup-variant.txt', import.meta.url),'utf8');

test('filters leftover navigation text',()=>{
  const {title,body}=parsePlainText(sample3);
  expect(title).toBe('Daily Reflection');
  expect(body).toBe('');
});

test('filters contribution and bookstore lines',()=>{
  const {title,body}=parsePlainText(sample4);
  expect(title).toBe('Daily Reflection');
  expect(body).toBe('');
});

test('filters skip links and super navigation',()=>{
  const {title,body}=parsePlainText(sample5);
  expect(title).toBe('Daily Reflection');
  expect(body).toBe('');
});

test('filters select your language mega menu',()=>{
  const {title,body}=parsePlainText(sample6);
  expect(title).toBe('Daily Reflection');
  expect(body).toBe('');
});

test('filters left/right navigation line',()=>{
  const {title,body}=parsePlainText(sample7);
  expect(title).toBe('Daily Reflection');
  expect(body).toBe('');
});

const html=fs.readFileSync(new URL('../tests/fixtures/daily-reflections.html', import.meta.url),'utf8');

const rss=fs.readFileSync(new URL('../tests/fixtures/rss-sample.xml', import.meta.url),'utf8');

test('parses saved daily reflections html',()=>{
  const {title,body}=parseDailyHtml(html);
  expect(title).toBe('ASKING FOR HELP');
  expect(body.length).toBeGreaterThan(100);
  expect(body).not.toMatch(/Make a Contribution/);
  expect(body).not.toMatch(/Select your language Mega Menu/);
});

test('parses sample rss feed',()=>{
  const {title,body}=parseDailyRss(rss);
  expect(title).toBe('ASKING FOR HELP');
  expect(body.length).toBeGreaterThan(200);
  expect(body).not.toMatch(/Make a Contribution/);
});

test('parses jina sample and strips nav',()=>{
  const res=parseJinaText(jina1);
  expect(res.title).toBe('I AM AN INSTRUMENT');
  expect(res.date).toBe('July 11');
  expect(res.quotes).toEqual([
    'We ask simply that throughout the day...',
    'Big Book p. 86'
  ]);
  expect(res.body).toMatch(/fear cloud my usefulness/);
  expect(res.body).not.toMatch(/Left \* Right/);
});

test('stops before footer link',()=>{
  const res=parseJinaText(jina2);
  expect(res.title).toBe('A SIMPLE CHOICE');
  expect(res.date).toBe('May 15');
  expect(res.body).not.toMatch(/Online Bookstore/);
  expect(res.body).toMatch(/Service is at the heart/);
});

test('dedupes duplicate quote lines',()=>{
  const res=parseJinaText(jinaDup);
  expect(res.quotes.length).toBe(2);
  expect(res.quotes[0]).toMatch(/throughout the day/);
  expect(res.quotes[1]).toMatch(/Big Book p. 86/);
});

test('dedupes and limits to two quote lines',()=>{
  const res=parseJinaText(dupQuote);
  expect(res.quotes.length).toBe(2);
  expect(res.quotes[0]).toMatch(/My stability came out/);
  expect(res.quotes[1]).toMatch(/THE LANGUAGE OF THE HEART/);
});

test('dedupes raw curly quote block',()=>{
  const res=parseJinaText(dupQuoteRaw);
  expect(res.quotes.length).toBe(2);
  expect(res.quotes[0]).toMatch(/We ask simply/);
  expect(res.quotes[1]).toMatch(/Big Book p\. 86/);
});

test('handles punctuation variants',()=>{
  const res=parseJinaText(dupQuoteVariant);
  expect(res.quotes.length).toBe(2);
  expect(res.quotes[0]).toMatch(/My stability came out/);
  expect(res.quotes[1]).toMatch(/THE LANGUAGE OF THE HEART/);
});

test('handles long quote block dedupe and promotion',()=>{
  const res=parseJinaText(dupQuoteLong);
  expect(res.quotes.length).toBe(2);
  expect(res.quotes[0]).toMatch(/My stability came out/);
  expect(res.quotes[1]).toMatch(/THE LANGUAGE OF THE HEART/);
  const match=res.body.match(/Thus I think it can work out with emotional sobriety/gi);
  expect(match?.length).toBe(1);
  expect(res.body.startsWith('Thus I think it can work out with emotional sobriety')).toBe(true);
  expect(res.body).not.toMatch(/Left \* Right/);
});

test('dedupes duplicated quote clusters',()=>{
  const p=parseJinaText(liveDupCluster);
  expect(p.quotes.length).toBeLessThanOrEqual(2);
  expect(p.quotes[0]).toMatch(/My stability came out of trying to give/i);
  expect(p.quotes[1]).toMatch(/THE LANGUAGE OF THE HEART/i);
  expect(p.body).toMatch(/Thus I think it can work out with emotional sobriety/i);
  expect((p.body.match(/emotional sobriety/gi) || []).length).toBe(2);
});

test('dedupes variant quote clusters with curly quotes',()=>{
  const p=parseJinaText(liveDupVariant);
  expect(p.quotes.length).toBeLessThanOrEqual(2);
  expect(p.quotes[0]).toMatch(/My stability came out of trying to give/i);
  expect(p.quotes[1]).toMatch(/THE LANGUAGE OF THE HEART/i);
  expect(p.body).toMatch(/Thus I think it can work out with emotional sobriety/i);
  expect((p.body.match(/emotional sobriety/gi) || []).length).toBe(2);
});
