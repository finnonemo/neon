import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Immersive pages share one content column. theme.css carries its width and
// end margins by hand from the Immersive Layout tokens (#113 "Content width"),
// so a re-export that moves those numbers at any tier fails here until
// theme.css follows.
const css = readFileSync(new URL('../../theme/css/theme.css', import.meta.url), 'utf8');
const breakpoints = JSON.parse(readFileSync(new URL('../../theme/tokens/breakpoint.json', import.meta.url), 'utf8'));
const tiers = Object.entries(breakpoints).map(([name, layouts]) => {
  const immersive = layouts['Immersive Layout'];
  return { name, minWidth: immersive['Viewport min-width'].value, endMargin: immersive['End margins'].value, contentMaxWidth: immersive['Content View max-width'].value };
});

// A block runs from its opening line to the first unindented closing brace.
const block = start => css.slice(css.indexOf(start), css.indexOf('\n}\n', css.indexOf(start)));
const declared = (text, name) => text.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();
const root = block(':root {');
const wideQuery = css.match(/@media \(min-width: (\d+)px\) \{\s*:root \{\s*--layout-endMargin/);
const px = value => Number(value?.replace(/px$/, ''));

test('the end margin matches every Immersive tier on either side of its one breakpoint', () => {
  assert.ok(wideQuery, 'theme.css lacks a min-width media query that widens --layout-endMargin');
  const breakpoint = Number(wideQuery[1]);
  const wide = declared(block(wideQuery[0]), 'layout-endMargin');
  for (const tier of tiers) {
    const expected = tier.minWidth < breakpoint ? declared(root, 'layout-endMargin') : wide;
    assert.equal(px(expected), tier.endMargin, `${tier.name} End margins`);
  }
});

test('the content column is the Content View max-width of the tiers it caps', () => {
  const width = px(declared(root, 'layout-contentMaxWidth'));
  const capped = tiers.filter(tier => tier.minWidth >= width);
  assert.ok(capped.length > 0, `no Immersive tier starts at ${width}px or wider`);
  for (const tier of capped) assert.equal(tier.contentMaxWidth, width, `${tier.name} Content View max-width`);
});

test('the layout variables are marked provisional and cite the breakpoint export', () => {
  const comment = root.slice(0, root.indexOf('--layout-')).split('/*').at(-1);
  assert.match(comment, /PROVISIONAL/);
  assert.match(comment, /theme\/tokens\/breakpoint\.json/);
});
