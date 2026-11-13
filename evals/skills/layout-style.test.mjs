import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// React warns, in development only, when a rerender adds or removes the
// `flex` shorthand on an element that also sets flexGrow, flexShrink or
// flexBasis: the shorthand can reset the longhand. The browser suite serves a
// production build, where the warning is silent, so the source is checked.
const root = fileURLToPath(new URL('../..', import.meta.url));
const dirs = ['registry/layout', 'templates/vitejs-cds/src/layout'];
const styles = text => text.match(/style=\{\{[\s\S]*?\}\}/g) ?? [];

for (const dir of dirs) {
  test(`${dir}: no style sets a conditional flex shorthand beside a flex longhand`, () => {
    const found = [];
    for (const file of readdirSync(join(root, dir)).filter(name => name.endsWith('.tsx'))) {
      for (const style of styles(readFileSync(join(root, dir, file), 'utf8'))) {
        const shorthand = style.match(/\bflex:\s*([^,}]+)/)?.[1] ?? '';
        if (/\?/.test(shorthand) && /\bflex(Grow|Shrink|Basis):/.test(style)) found.push(file);
      }
    }
    assert.deepEqual(found, []);
  });
}
