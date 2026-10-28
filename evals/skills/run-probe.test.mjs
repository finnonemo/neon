import test from 'node:test';
import assert from 'node:assert/strict';
import { fixtureFailures } from './run-probe.mjs';

const expected = { darkBackgroundControls: { 'black-on-navy': 1.16, 'oklch-dark': 17.18 }, underlinedNavLinks: ['nav-text'] };
const reported = (contrasts, links = ['a#nav-text']) => ({
  darkBackgroundControls: Object.entries(contrasts).map(([id, contrast]) => ({ element: `button#${id}`, contrast })),
  underlinedNavLinks: links,
});

test('fixture contrast matches to two decimals', () => {
  assert.deepEqual(fixtureFailures('light', expected, reported({ 'black-on-navy': 1.164, 'oklch-dark': 17.18 })), []);
});

test('fixture contrast that differs at the second decimal fails', () => {
  assert.deepEqual(fixtureFailures('light', expected, reported({ 'black-on-navy': 1.17, 'oklch-dark': 17.18 })), [
    'light darkBackgroundControls black-on-navy: contrast 1.17, expected 1.16',
  ]);
});

test('a misread color with the same ids fails', () => {
  // #44's mutation check: browser-probe.js reading oklch() as rgb() reported oklch-dark at 1.17.
  assert.deepEqual(fixtureFailures('light', expected, reported({ 'black-on-navy': 1.16, 'oklch-dark': 1.17 })), [
    'light darkBackgroundControls oklch-dark: contrast 1.17, expected 17.18',
  ]);
});

test('a missing contrast fails', () => {
  assert.deepEqual(fixtureFailures('light', expected, reported({ 'black-on-navy': undefined, 'oklch-dark': 17.18 })), [
    'light darkBackgroundControls black-on-navy: contrast undefined, expected 1.16',
  ]);
});

test('a wrong id set fails', () => {
  assert.deepEqual(fixtureFailures('dark', expected, reported({ 'black-on-navy': 1.16 }, [])), [
    'dark darkBackgroundControls: reported [black-on-navy], expected [black-on-navy,oklch-dark]',
    'dark underlinedNavLinks: reported [], expected [nav-text]',
  ]);
});

test('a category of ids checks no contrast', () => {
  assert.deepEqual(fixtureFailures('light', { underlinedNavLinks: ['nav-text'] }, { underlinedNavLinks: [{ element: 'a#nav-text', contrast: 99 }] }), []);
});
