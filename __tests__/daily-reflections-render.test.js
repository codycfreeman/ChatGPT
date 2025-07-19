import {parseJinaText, buildBlockquote} from '../widgets/daily-reflections-lib.js';
import fs from 'fs';

const dupText = fs.readFileSync(new URL('../tests/fixtures/false-pride-dup.txt', import.meta.url), 'utf8');

test('buildBlockquote dedupes identical quote pairs', () => {
  const p = parseJinaText(dupText);
  const html = buildBlockquote(p.quotes);
  const match = html.match(/<p\b/gi) || [];
  expect(match.length).toBe(2);
});
