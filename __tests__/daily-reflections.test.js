import {parsePlainText} from '../widgets/daily-reflections-lib.js';
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

test('filters leftover navigation text',()=>{
  const {title,body}=parsePlainText(sample3);
  expect(title).toBe('Daily Reflection');
  expect(body).toBe('');
});

test('filters meetings and anonymity links',()=>{
  const {title,body}=parsePlainText(sample4);
  expect(title).toBe('Daily Reflection');
  expect(body).toBe('');
});