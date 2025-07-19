import { dedupeQuotes } from '../widgets/daily-reflections-lib.js';

test('hash dedupe removes duplicates even with punctuation/whitespace changes', async () => {
  const lines = [
    '**My stability came out of trying to give, not out of demanding that I receive.**',
    '**TWELVE STEPS AND TWELVE TRADITIONS, p. 75**',
    '**  “My stability came out of trying to give, not out of demanding that I receive.”  **',
    '**TWELVE\u00A0STEPS\u00A0AND\u00A0TWELVE\u00A0TRADITIONS,\u00A0p.\u00A075**'
  ];
  const cleaned = lines.map(l => l.replace(/^\*\*|\*\*$/g,'').trim());
  const result = dedupeQuotes(cleaned);
  expect(result.length).toBe(2);
  expect(result[0]).toMatch(/My stability came out/i);
  expect(result[1]).toMatch(/TWELVE STEPS AND TWELVE TRADITIONS/i);
});
