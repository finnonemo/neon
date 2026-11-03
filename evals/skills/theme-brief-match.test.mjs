import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRegistry, neonRegistryUrl } from '../../scripts/lib/registry.mjs';
import { listThemeBriefs, matchThemeBrief } from '../../scripts/lib/theme-brief.mjs';

// The shipped Theme Brief listing and recognition (scripts/theme-brief.mjs),
// driven against this checkout's registry build through a fake fetch, so CI
// needs no network.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const url = 'http://registry.test/r';
const built = await buildRegistry({ root, url });
const fetchJson = async (address) => {
  const file = address.startsWith(`${url}/`) && built.get(address.slice(url.length + 1));
  if (!file) throw new Error(`${address} answered 404`);
  return JSON.parse(file);
};
const unreachable = async (address) => { throw new Error(`fetch failed for ${address}`); };
const clubRun = await readFile(join(root, 'registry/theme-briefs/club-run.md'), 'utf8');
const lines = clubRun.split('\n');

test('lists every Theme Brief item with its title, tagline, theme and occasion', async () => {
  const briefs = await listThemeBriefs({ url, fetchJson });
  const { items } = JSON.parse(built.get('registry.json'));
  assert.deepEqual(briefs.map(brief => brief.name).sort(), items.filter(item => item.categories?.includes('theme-brief')).map(item => item.name).sort());
  assert.deepEqual(briefs.find(brief => brief.name === 'theme-brief-club-run'), {
    name: 'theme-brief-club-run',
    title: 'Club · Run',
    tagline: 'Running shoes on a white canvas — a shared start line and an open invitation to sign up',
    theme: 'club',
    occasion: 'run',
  });
});

test('listing an unreachable index fails instead of guessing names', async () => {
  await assert.rejects(listThemeBriefs({ url, fetchJson: unreachable }), /unreachable/);
});

test('a published brief, wherever it is saved, is a Theme Brief', async () => {
  assert.deepEqual(await matchThemeBrief({ text: clubRun, url, fetchJson }), { verdict: 'brief', item: 'theme-brief-club-run', theme: 'club' });
});

test('a brief whose content differs from its registry item is offered a re-add', async () => {
  const edited = clubRun.replace('Running shoes', 'Trail shoes');
  const result = await matchThemeBrief({ text: edited, url, fetchJson });
  assert.equal(result.verdict, 'differs');
  assert.equal(result.item, 'theme-brief-club-run');
});

test('a file without the header and status paragraph is a Reference Design', async () => {
  const refero = '# Lumora — Style Reference\n> Dark, lime and ultraviolet\n\nUse Space Grotesk.\n';
  const result = await matchThemeBrief({ text: refero, url, fetchJson });
  assert.equal(result.verdict, 'reference-design');
  assert.match(result.reason, /no Theme Brief header/);
  // The status paragraph is part of the header rule.
  const noStatus = lines.filter(line => !line.startsWith('This is a Finnomena Theme Brief')).join('\n');
  assert.match((await matchThemeBrief({ text: noStatus, url, fetchJson })).reason, /no Theme Brief header/);
});

test('a file retitled as a Theme Brief that matches no registry item is a Reference Design', async () => {
  const retitled = ['# Finnomena Ultra · Gala — Theme Brief', ...lines.slice(1)].join('\n').replace('**Immersive Theme:** club', '**Immersive Theme:** ultra');
  const result = await matchThemeBrief({ text: retitled, url, fetchJson });
  assert.equal(result.verdict, 'reference-design');
  assert.match(result.reason, /Ultra · Gala.*matches no Theme Brief/);
});

test('a header whose Immersive Theme line disagrees with its item is not a match', async () => {
  const mislabelled = clubRun.replace('**Immersive Theme:** club', '**Immersive Theme:** ultra');
  assert.equal((await matchThemeBrief({ text: mislabelled, url, fetchJson })).verdict, 'reference-design');
});

test('with the index unreachable a headed file is a Reference Design, and the reason says so', async () => {
  const result = await matchThemeBrief({ text: clubRun, url, fetchJson: unreachable });
  assert.equal(result.verdict, 'reference-design');
  assert.match(result.reason, /unreachable/);
});

test('the registry URL is the installer\'s: --registry, then NEON_REGISTRY_URL, then the pinned release', async () => {
  const { version } = JSON.parse(await readFile(join(root, '.claude-plugin/plugin.json'), 'utf8'));
  assert.equal(await neonRegistryUrl({ registry: 'http://a/r', env: { NEON_REGISTRY_URL: 'http://b/r' }, root }), 'http://a/r');
  assert.equal(await neonRegistryUrl({ env: { NEON_REGISTRY_URL: 'http://b/r' }, root }), 'http://b/r');
  assert.equal(await neonRegistryUrl({ env: {}, root }), `https://raw.githubusercontent.com/finnonemo/neon/neon--v${version}/registry/r`);
});

test('the CLI states each verdict on its first line', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'neon-brief-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, 'DESIGN.md');
  await writeFile(file, '# Lumora — Style Reference\n');
  const cli = (...args) => spawnSync(process.execPath, [join(root, 'scripts/theme-brief.mjs'), ...args], { encoding: 'utf8', env: { ...process.env, NEON_REGISTRY_URL: 'http://127.0.0.1:9/r' } });
  const match = cli('match', file);
  assert.equal(match.status, 0, match.stderr);
  assert.match(match.stdout.split('\n')[0], /^Reference Design: /);
  const list = cli('list');
  assert.equal(list.status, 2);
  assert.match(list.stdout + list.stderr, /unreachable/);
  assert.equal(cli('guess').status, 1);
});
