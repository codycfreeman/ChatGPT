import {parsePlainText, parseDailyHtml} from '../widgets/daily-reflections-lib.js';
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

const html=fs.readFileSync(new URL('../tests/fixtures/daily-reflections.html', import.meta.url),'utf8');

test('parses saved daily reflections html',()=>{
  const {title,body}=parseDailyHtml(html);
  expect(title).toBe('ASKING FOR HELP');
  expect(body.length).toBeGreaterThan(100);
  expect(body).not.toMatch(/Make a Contribution/);
  expect(body).not.toMatch(/Select your language Mega Menu/);
});