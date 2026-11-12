import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inflateRawSync } from 'node:zlib';
import { packagePlugin } from '../../scripts/package-plugin.mjs';
import { candidates, options, render } from '../../scripts/lib/finno/artwork.mjs';
import { handle } from '../../scripts/lib/finno/mcp.mjs';
import { TOOLS, VERSION } from '../../scripts/lib/finno/tools.mjs';
import { desktopConfigPath, detect, planFor, selfTest, serverCommand, setup } from '../../scripts/lib/finno/setup.mjs';
import { zipDirectory } from '../../scripts/lib/finno/zip.mjs';

const root = join(import.meta.dirname, '../..');
const scratch = () => mkdtemp(join(tmpdir(), 'finno-test-'));
const PNG = [0x89, 0x50, 0x4e, 0x47];
const AD = { format: 'story-9-16', layout: 'headline', headline: 'ลงทุน [ทุกเดือน] with Finnomena' };

test('options lists only what this release draws, and every id it lists is accepted', async () => {
  const listed = await options();
  assert.deepEqual(listed.layouts.map(layout => layout.id), ['pattern', 'headline', 'cover', 'closing']);
  assert.ok(!listed.formats.some(format => format.id === 'custom'));
  assert.equal(listed.colourways.length, 29);
  assert.deepEqual(listed.layouts.find(layout => layout.id === 'cover').text, ['headline', 'secondary', 'label']);
  const out = await scratch();
  for (const format of listed.formats) {
    const drawn = await render({ format: format.id, seed: 'every-format', pngScale: 0.1, out });
    assert.equal(drawn.width, format.width);
  }
});

test('a Candidate set is the same twelve every time, and render draws the one picked', async () => {
  const out = await scratch();
  const first = await candidates({ ...AD, set: 'regression-1', out });
  const again = await candidates({ ...AD, set: 'regression-1', out });
  assert.equal(first.count, 12);
  assert.deepEqual([...first.png.subarray(0, 4)], PNG);
  assert.ok(first.png.equals(again.png), 'the same set and settings must draw the same sheet');
  const other = await candidates({ ...AD, out });
  assert.notEqual(other.set, first.set);

  const picked = await render({ ...AD, set: 'regression-1', pick: 7, out });
  const repeat = await render({ ...AD, set: 'regression-1', pick: 7, out, name: 'repeat' });
  const svg = await readFile(picked.files.svg, 'utf8');
  assert.equal(svg, await readFile(repeat.files.svg, 'utf8'));
  assert.match(svg, /^<svg[^>]* viewBox="0 0 1080 1920"/);
  assert.ok(!svg.includes('<text'), 'text is drawn as outlines, so the SVG needs no font where it is opened');
  assert.deepEqual([...(await readFile(picked.files.png)).subarray(0, 4)], PNG);
  assert.equal(JSON.parse(await readFile(picked.files.document, 'utf8')).app, 'fnm-pattern-builder');
  assert.match(picked.openInBlock, /^https:\/\/block-ten-chi\.vercel\.app\/#p=/);
  assert.notEqual(svg, await readFile((await render({ ...AD, set: 'regression-1', pick: 8, out })).files.svg, 'utf8'));

  // Words and Colourway change the Page, not the Pattern the Candidate holds.
  const recoloured = await render({ ...AD, headline: 'Other words', colourway: 'grey__navy-100', set: 'regression-1', pick: 7, out });
  assert.equal(recoloured.seed, picked.seed);
});

test('a request outside the guideline or this release is refused in words, and nothing is written', async () => {
  const out = join(await scratch(), 'never');
  const refusals = [
    [{ colourway: 'pink' }, /Unknown colourway/],
    [{ layout: 'content' }, /not drawn yet/],
    [{ headline: 'Hello' }, /"pattern" has no text/],
    [{ layout: 'headline', label: 'REPORT' }, /no place for label/],
    [{ pick: 3 }, /give the set/],
    [{ set: 'x' }, /needs a pick/],
    [{ set: 'x', pick: 13 }, /from 1 to 12/],
    [{ format: 'square', width: 500, height: 500 }, /not both/],
    [{ width: 10, height: 10 }, /between 64 and 8000/],
    [{ pngScale: 9 }, /pngScale/],
  ];
  for (const [settings, message] of refusals) await assert.rejects(render({ ...settings, out }), message);
  assert.equal(existsSync(out), false);
});

test('the tool server lists the three tools and answers a refusal as a tool error the agent can read', async () => {
  const out = await scratch();
  const call = (id, method, params) => handle({ jsonrpc: '2.0', id, method, params });
  const started = await call(1, 'initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '0' } });
  assert.equal(started.result.protocolVersion, '2025-06-18');
  assert.equal(started.result.serverInfo.version, VERSION);
  assert.equal(await handle({ jsonrpc: '2.0', method: 'notifications/initialized' }), undefined);
  const listed = (await call(2, 'tools/list')).result.tools;
  assert.deepEqual(listed.map(tool => tool.name), ['options', 'candidates', 'render']);
  for (const tool of listed) assert.equal(tool.inputSchema.type, 'object');

  const sheet = (await call(3, 'tools/call', { name: 'candidates', arguments: { format: 'link-1-91', out } })).result;
  assert.deepEqual(sheet.content.map(part => part.type), ['text', 'image']);
  assert.deepEqual([...Buffer.from(sheet.content[1].data, 'base64').subarray(0, 4)], PNG);
  const { set } = JSON.parse(sheet.content[0].text);
  const drawn = (await call(4, 'tools/call', { name: 'render', arguments: { format: 'link-1-91', set, pick: 2, out } })).result;
  assert.ok(existsSync(JSON.parse(drawn.content[0].text).files.svg));

  const refused = (await call(5, 'tools/call', { name: 'render', arguments: { colourway: 'pink' } })).result;
  assert.equal(refused.isError, true);
  assert.match(refused.content[0].text, /Unknown colourway/);
  assert.equal((await call(6, 'tools/call', { name: 'render', arguments: { colour: 'red' } })).result.isError, true);
  assert.equal((await call(7, 'tools/call', { name: 'render', arguments: { pick: '3' } })).result.isError, true);
  assert.equal((await call(8, 'nope')).error.code, -32601);
});

test('the packaged plugin draws on its own: no dependencies, no Trek, text in IBM Plex Sans Thai with a warning', async () => {
  const destination = await scratch();
  await packagePlugin({ destination });
  assert.equal(existsSync(join(destination, 'node_modules')), false);
  assert.deepEqual((await readdir(join(destination, 'block/fonts'))).filter(name => name.includes('Trek')), []);
  const out = await scratch();
  const run = spawnSync(process.execPath, [join(destination, 'scripts/finno.mjs'), 'render', '--layout', 'cover', '--headline', 'Annual [Outlook]', '--label', 'REPORT', '--seed', 'packaged', '--out', out, '--json'],
    { encoding: 'utf8', cwd: destination, env: { ...process.env, FINNO_FONTS_DIR: '' } });
  assert.equal(run.status, 0, run.stderr);
  const drawn = JSON.parse(run.stdout);
  assert.equal(drawn.typeface, 'IBM Plex Sans Thai');
  assert.deepEqual(drawn.warnings.map(warning => warning.code), ['finno.plexTypeface']);
  assert.ok(existsSync(drawn.files.svg));
  // The plugin manifest starts this same file as the tool server.
  const manifest = JSON.parse(await readFile(join(destination, '.claude-plugin/plugin.json'), 'utf8'));
  assert.deepEqual(manifest.mcpServers.finno.args, ['${CLAUDE_PLUGIN_ROOT}/scripts/finno.mjs', 'mcp']);
  const answered = await selfTest({ args: [join(destination, 'scripts/finno.mjs'), 'mcp'] });
  assert.deepEqual(answered.tools, TOOLS.map(tool => tool.name));
});

test('the command line refuses an unknown setting and exits 1 without a stack trace', () => {
  const run = spawnSync(process.execPath, [join(root, 'scripts/finno.mjs'), 'render', '--colour', 'red'], { encoding: 'utf8' });
  assert.equal(run.status, 1);
  assert.match(run.stderr, /takes no --colour/);
  assert.doesNotMatch(run.stderr, /\n\s+at /);
});

test('the npm package is the plugin: one version, the command, and never the Trek font files', async () => {
  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.name, 'finno');
  assert.equal(pkg.version, VERSION);
  assert.equal(pkg.version, JSON.parse(await readFile(join(root, '.codex-plugin/plugin.json'), 'utf8')).version);
  assert.ok(existsSync(join(root, pkg.bin.finno)));
  assert.equal(pkg.dependencies, undefined, 'the plugin installs from the repository with no install step');
  assert.ok(pkg.files.includes('!block/fonts/FinnomenaTrek-*'));
  for (const entry of ['.claude-plugin', 'skills', 'theme', 'registry', 'templates', 'core', 'block', 'scripts']) assert.ok(pkg.files.includes(entry), entry);
});

// The agents' own commands, answered as a computer with all three agents and nothing of Neon would.
function fakeAgents(state = { marketplace: false, plugin: false, server: false }) {
  const calls = [];
  const run = (command, args) => {
    calls.push([command, ...args].join(' '));
    const line = args.join(' ');
    if (line === '--version') return { ok: true, output: '1.0.0' };
    if (line === 'plugin marketplace list --json') return { ok: true, output: JSON.stringify(state.marketplace ? [{ name: 'finnomena-plugins' }] : []) };
    if (line === 'plugin list --json') return { ok: true, output: JSON.stringify(state.plugin ? [{ id: 'neon@finnomena-plugins' }] : []) };
    if (line === 'plugin marketplace list') return { ok: true, output: `MARKETPLACE ROOT\n${state.marketplace ? 'finnomena-plugins /x\n' : ''}` };
    if (line === 'mcp list') return { ok: true, output: `Name Command\n${state.server ? 'finno npx\n' : ''}` };
    if (/marketplace add/.test(line)) state.marketplace = true;
    if (/plugin (install|add) neon@/.test(line)) state.plugin = true;
    if (/^mcp add finno/.test(line)) state.server = true;
    if (/^mcp remove finno/.test(line)) state.server = false;
    return { ok: true, output: '' };
  };
  return { run, calls, state };
}

test('setup shows its plan and changes nothing until told to', async () => {
  const home = await scratch();
  await mkdir(join(home, 'Library/Application Support/Claude'), { recursive: true });
  const { run, calls } = fakeAgents();
  const lines = [];
  const code = await setup([], { run, home, platform: 'darwin', log: line => lines.push(line), interactive: false });
  const shown = lines.join('\n');
  assert.equal(code, 0);
  assert.match(shown, /claude plugin marketplace add finnonemo\/neon/);
  assert.match(shown, /claude plugin install neon@finnomena-plugins/);
  assert.match(shown, /codex plugin add neon@finnomena-plugins/);
  assert.match(shown, /codex mcp add finno/);
  assert.match(shown, /claude_desktop_config\.json/);
  assert.match(shown, /Nothing has been changed/);
  assert.ok(calls.every(call => /--version| list/.test(call)), `setup ran a changing command before approval: ${calls.join('; ')}`);
  assert.equal(existsSync(desktopConfigPath({ home, platform: 'darwin' })), false);
});

test('setup --yes installs through each agent\'s own commands, keeps a backup of the Desktop file and verifies', async () => {
  const home = await scratch();
  const config = desktopConfigPath({ home, platform: 'darwin' });
  await mkdir(join(config, '..'), { recursive: true });
  const before = `${JSON.stringify({ theme: 'dark', mcpServers: { other: { command: 'x' } } })}\n`;
  await writeFile(config, before);
  const { run, calls } = fakeAgents();
  const lines = [];
  const code = await setup(['--yes'], { run, home, platform: 'darwin', log: line => lines.push(line), interactive: false, test: async () => ({ tools: ['options', 'candidates', 'render'], formats: 7, colourways: 29 }) });
  assert.equal(code, 0, lines.join('\n'));
  assert.ok(calls.includes('claude plugin marketplace add finnonemo/neon'));
  assert.ok(calls.includes('claude plugin install neon@finnomena-plugins'));
  assert.ok(calls.some(call => call.startsWith('codex mcp add finno')));
  const after = JSON.parse(await readFile(config, 'utf8'));
  assert.equal(after.theme, 'dark');
  assert.deepEqual(after.mcpServers.other, { command: 'x' });
  assert.equal(after.mcpServers.finno.args.at(-1), 'mcp');
  const backups = (await readdir(join(config, '..'))).filter(name => name.includes('.finno-backup-'));
  assert.equal(backups.length, 1);
  assert.equal(await readFile(join(config, '..', backups[0]), 'utf8'), before);
});

test('setup leaves a Desktop file it cannot read as it is, says so, and exits 1', async () => {
  const home = await scratch();
  const config = desktopConfigPath({ home, platform: 'darwin' });
  await mkdir(join(config, '..'), { recursive: true });
  await writeFile(config, '{ not json');
  const lines = [];
  const code = await setup(['--yes', '--agent', 'claude-desktop'], { run: () => ({ ok: false, output: '' }), home, platform: 'darwin', log: line => lines.push(line), interactive: false, test: async () => ({ tools: [], formats: 0, colourways: 0 }) });
  assert.equal(code, 1);
  assert.match(lines.join('\n'), /not valid JSON, so it was left as it is/);
  assert.equal(await readFile(config, 'utf8'), '{ not json');
});

test('setup updates what is already there, and registers the published package through npx at this version', () => {
  const { run } = fakeAgents({ marketplace: true, plugin: true, server: true });
  const found = detect({ run, home: '/nowhere', platform: 'linux', env: {} });
  const published = serverCommand({ root: '/home/u/.npm/_npx/abc/node_modules/finno', platform: 'linux', execPath: '/usr/bin/node' });
  assert.deepEqual(published.args, ['-y', `finno@${VERSION}`, 'mcp']);
  assert.ok(published.env.PATH.startsWith('/usr/bin'));
  assert.deepEqual(serverCommand({ root: 'C:\\x\\node_modules\\finno'.split('\\').join(require_sep()), platform: 'win32' }).args.slice(0, 3), ['/c', 'npx', '-y']);
  const commands = planFor(found, { server: published }).map(step => step.command.join(' '));
  assert.deepEqual(commands.slice(0, 2), ['claude plugin marketplace update finnomena-plugins', 'claude plugin update neon@finnomena-plugins']);
  assert.ok(commands.includes('codex mcp remove finno'));
  assert.ok(commands.at(-1).endsWith(`-- ${published.command} -y finno@${VERSION} mcp`));
  assert.ok(!commands.some(command => command.includes('marketplace add')));
});
function require_sep() { return process.platform === 'win32' ? '\\' : '/'; }

test('the plugin zip holds the packaged plugin, readable by any unzip', async () => {
  const directory = await scratch();
  await mkdir(join(directory, 'skills/neon-block'), { recursive: true });
  await writeFile(join(directory, 'skills/neon-block/SKILL.md'), '# ภาพ\n'.repeat(50));
  await writeFile(join(directory, 'a.txt'), 'a');
  const zip = await zipDirectory(directory);
  assert.equal(zip.readUInt32LE(0), 0x04034b50);
  assert.equal(zip.readUInt16LE(zip.length - 22 + 10), 2, 'two entries in the central directory');
  const nameLength = zip.readUInt16LE(26);
  assert.equal(zip.subarray(30, 30 + nameLength).toString(), 'a.txt');
  assert.equal(inflateRawSync(zip.subarray(30 + nameLength, 30 + nameLength + zip.readUInt32LE(18))).toString(), 'a');
  const file = join(await scratch(), 'plugin.zip');
  await writeFile(file, zip);
  const unzip = spawnSync('unzip', ['-tq', file], { encoding: 'utf8' });
  if (!unzip.error) assert.equal(unzip.status, 0, unzip.stdout + unzip.stderr);
});
