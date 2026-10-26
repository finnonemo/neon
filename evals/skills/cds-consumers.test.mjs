import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, realpath, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { cdsPackageDirs, findConsumers } from '../../scripts/lib/cds-consumers.mjs';

async function fakeCds(t, files) {
  const root = await mkdtemp(join(tmpdir(), 'neon-cds-consumers-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [path, content] of Object.entries(files)) {
    await mkdir(join(root, path, '..'), { recursive: true });
    await writeFile(join(root, path), content);
  }
  return ['cds-web', 'cds-common'].map(name => join(root, name));
}

test('finds a token in minified CSS variables and in JS token maps', async t => {
  const dirs = await fakeCds(t, {
    'cds-web/esm/media/Avatar.css': ".a[data-colorscheme='blue']{color:rgb(var(--blue60))}.b{color:var(--color-fgInverse)}",
    'cds-common/esm/tokens/tags.js': "export const map = { blue: { background: 'blue0', foreground: 'blue60' } };\n",
  });
  const found = await findConsumers(dirs, ['blue60', 'fgInverse']);
  assert.deepEqual(found.map(({ token, file, line }) => `${token} ${file}:${line}`).sort(), [
    'blue60 cds-common/esm/tokens/tags.js:1',
    'blue60 cds-web/esm/media/Avatar.css:1',
    'fgInverse cds-web/esm/media/Avatar.css:1',
  ]);
  assert.match(found.find(m => m.file.endsWith('Avatar.css') && m.token === 'blue60').snippet, /color:rgb\(var\(--blue60\)\)/);
});

test('skips longer tokens that contain it and theme definition files', async t => {
  const dirs = await fakeCds(t, {
    'cds-web/esm/tag/Tag.js': "const steps = ['blue600', 'xblue60'];\n",
    'cds-web/esm/themes/defaultTheme.js': "const lightSpectrum = { blue60: '0,82,255' };\n",
    'cds-common/esm/index.js': '',
  });
  assert.deepEqual(await findConsumers(dirs, ['blue60']), []);
});

test('cdsPackageDirs takes the first app with both CDS packages installed', async t => {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'neon-cds-apps-')));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const app of ['bare', 'starter']) await mkdir(join(root, app), { recursive: true });
  for (const name of ['cds-web', 'cds-common']) {
    await mkdir(join(root, 'starter/node_modules/@coinbase', name), { recursive: true });
    await writeFile(join(root, 'starter/node_modules/@coinbase', name, 'package.json'), `{"name":"@coinbase/${name}"}`);
  }
  const found = cdsPackageDirs([join(root, 'bare'), join(root, 'starter')]);
  assert.equal(found.app, join(root, 'starter'));
  assert.deepEqual(found.packageDirs, ['cds-web', 'cds-common'].map(name => join(root, 'starter/node_modules/@coinbase', name)));
  assert.equal(cdsPackageDirs([join(root, 'bare')]), undefined);
});
