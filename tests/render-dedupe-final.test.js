import { buildBlockquote } from '../widgets/daily-reflections-lib.js';

test('global dedupe removes non-consecutive duplicates', () => {
  const raw = [
    'Quote A',
    'Source B',
    'Quote A',           // dup
    'Source B',          // dup
    'Quote A',           // dup again
  ];
  const uniq = buildBlockquote.dedupe(raw);
  expect(uniq.length).toBe(2);
  expect(uniq[0]).toMatch(/Quote A/i);
  expect(uniq[1]).toMatch(/Source B/i);
});
