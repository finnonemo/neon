// The neon-deck skill and its template must agree: the skill tells the agent which size to draw a
// Pattern at, and the template places that file whole in a slot of the same size.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const skill = readFileSync(`${root}skills/neon-deck/SKILL.md`, 'utf8');
const template = readFileSync(`${root}skills/neon-deck/assets/deck.html`, 'utf8');

test('the panel the skill draws is the size of the template slot', () => {
  const [, width] = template.match(/--panel:(\d+)px/);
  assert.match(skill, new RegExp(`--width ${width} --height 1080`));
  assert.match(template, /#deck\{[^}]*width:1920px;height:1080px/);
});

test('every artwork slot shows its file whole, at the slot size', () => {
  const rules = [...template.matchAll(/\.slide[^{]*img[^{]*\{([^}]*)\}/g)].map(match => match[1]);
  assert.equal(rules.length, 2);
  for (const rule of rules) assert.doesNotMatch(rule, /object-fit|background|clip|opacity|filter/);
  for (const [, source] of template.matchAll(/<img[^>]*src="([^"]+)"/g)) assert.match(source, /^finnomena-artwork\/[\w-]+\.svg$/);
});

test('the template carries the check the skill names', () => {
  assert.match(skill, /\?check/);
  assert.match(template, /window\.deckCheck =/);
  assert.match(template, /has\('check'\)/);
});
