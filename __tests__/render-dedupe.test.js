import { dedupeRenderQuotes } from '../widgets/daily-reflections-lib.js';

test('render-time dedupe', () => {
  const arr = [
    'Quote line A',
    'Source line B',
    'Quote line A',
    'Source line B'
  ];
  const out = dedupeRenderQuotes(arr);
  expect(out.length).toBe(2);
  expect(out[0]).toMatch(/Quote line A/i);
  expect(out[1]).toMatch(/Source line B/i);
});
