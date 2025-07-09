import {parsePlainText} from '../widgets/daily-reflections-lib.js';

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
