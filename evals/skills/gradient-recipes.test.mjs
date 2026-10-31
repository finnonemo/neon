import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contrast } from '../../scripts/lib/colors.mjs';

const read = path => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const colors = JSON.parse(read('theme/tokens/colors.json'));
const hex = (family, step) => {
  const value = colors[family]?.[step]?.value;
  assert.ok(value, `${family}/${step} is not in theme/tokens/colors.json`);
  return value;
};

// The recipe table in the design contract is the only source of the recipes.
const section = read('skills/INSTRUCTION.md').split('\n## Gradients\n')[1].split('\n## ')[0];
const recipes = Object.fromEntries(section.split('\n')
  .filter(line => line.startsWith('| ') && !line.startsWith('| Recipe') && !line.startsWith('| ---'))
  .map(line => line.split('|').slice(1, -1).map(cell => cell.trim()))
  .map(([name, stops, text]) => [name, { stops, text }]));
const navy = hex('Navy', '100');
const white = hex('White', '100');

test('the contract defines the three provisional recipes', () => {
  assert.deepEqual(Object.keys(recipes), ['Tint fade', 'Navy depth', 'Field to navy']);
  assert.match(section, /provisional/);
});

test('tint fade text reaches 4.5:1 on every step of its listed families', () => {
  const families = recipes['Tint fade'].text.replace(/^Navy, on /, '').split(/, | or /);
  assert.ok(families.length > 0);
  for (const family of families) {
    for (const step of ['25', '50', '75', '100']) {
      const ratio = contrast(navy, hex(family, step));
      assert.ok(ratio >= 4.5, `navy on ${family}/${step}: ${ratio.toFixed(2)}`);
    }
  }
});

test('navy depth stops exist and white text reaches 4.5:1 on each', () => {
  assert.equal(recipes['Navy depth'].text, 'White');
  const stops = [...recipes['Navy depth'].stops.matchAll(/(\w[\w ]*?)\/(\d+)/g)];
  assert.equal(stops.length, 2);
  for (const [, family, step] of stops) {
    const ratio = contrast(white, hex(family, step));
    assert.ok(ratio >= 4.5, `white on ${family}/${step}: ${ratio.toFixed(2)}`);
  }
});

// Field to navy must not claim a safe text color: neither navy nor white
// passes at both ends for any family, so text placement decides it.
test('field to navy stays placement-dependent', () => {
  assert.equal(recipes['Field to navy'].text, 'Placement-dependent');
  const families = Object.keys(colors).filter(family => !['Black', 'White', 'Grey', 'Navy'].includes(family));
  for (const family of families) {
    for (const step of ['25', '50']) {
      for (const text of [navy, white]) {
        const worst = Math.min(contrast(text, hex(family, step)), contrast(text, navy));
        assert.ok(worst < 4.5, `${text} passes ${family}/${step} → Navy/100; the table could name it`);
      }
    }
  }
});
