// `finno setup` (ADR 0010): installs Neon into the agents on this computer. It shows its plan and changes nothing
// until told to, keeps a backup of a configuration file it rewrites, and checks afterwards that the tools answer.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { delimiter, dirname, join, resolve, sep } from 'node:path';
import { createInterface } from 'node:readline';
import { NEON_ROOT } from './artwork.mjs';
import { VERSION } from './tools.mjs';

const MARKETPLACE = 'finnomena-plugins';
const PLUGIN = `neon@${MARKETPLACE}`;
const DEFAULT_SOURCE = 'finnonemo/neon';
const AGENTS = ['claude-code', 'codex', 'claude-desktop'];
const NAMES = { 'claude-code': 'Claude Code', codex: 'Codex', 'claude-desktop': 'Claude Desktop' };

const defaultRun = (command, args) => {
  const result = spawnSync(command, args, { encoding: 'utf8', shell: process.platform === 'win32' });
  return { ok: result.status === 0, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
};

export function desktopConfigPath({ home = homedir(), platform = process.platform, env = process.env } = {}) {
  if (platform === 'darwin') return join(home, 'Library/Application Support/Claude/claude_desktop_config.json');
  if (platform === 'win32') return join(env.APPDATA ?? join(home, 'AppData/Roaming'), 'Claude/claude_desktop_config.json');
  return join(env.XDG_CONFIG_HOME ?? join(home, '.config'), 'Claude/claude_desktop_config.json');
}

/**
 * How an agent starts the tool server. From the published package it is `npx finno@<this version>`, so the agent
 * keeps working after this run's files are gone. From a checkout it is this checkout's own file, which is not on npm.
 */
export function serverCommand({ root = NEON_ROOT, platform = process.platform, execPath = process.execPath } = {}) {
  const published = root.split(sep).includes('node_modules');
  if (!published) return { command: execPath, args: [join(root, 'scripts/finno.mjs'), 'mcp'], env: {}, published };
  const args = ['-y', `finno@${VERSION}`, 'mcp'];
  if (platform === 'win32') return { command: 'cmd', args: ['/c', 'npx', ...args], env: {}, published };
  // A desktop app does not start with the shell's PATH, so name where this Node is.
  const nodeDir = dirname(execPath);
  const path = [...new Set([nodeDir, '/opt/homebrew/bin', '/usr/local/bin', '/usr/bin', '/bin'])].join(delimiter);
  return { command: existsSync(join(nodeDir, 'npx')) ? join(nodeDir, 'npx') : 'npx', args, env: { PATH: path }, published };
}

/** What is on this computer: which agents, and what of Neon each already has. */
export function detect({ run = defaultRun, ...where } = {}) {
  const found = {};
  if (run('claude', ['--version']).ok) {
    const json = (args) => { try { return JSON.parse(run('claude', args).output); } catch { return []; } };
    found['claude-code'] = {
      marketplace: json(['plugin', 'marketplace', 'list', '--json']).some(entry => entry.name === MARKETPLACE),
      plugin: json(['plugin', 'list', '--json']).some(entry => entry.id === PLUGIN),
    };
  }
  if (run('codex', ['--version']).ok) {
    const rows = args => run('codex', args).output.split('\n').map(line => line.trim().split(/\s+/)[0]);
    found.codex = {
      marketplace: rows(['plugin', 'marketplace', 'list']).includes(MARKETPLACE),
      server: rows(['mcp', 'list']).includes('finno'),
    };
  }
  const config = desktopConfigPath(where);
  if (existsSync(dirname(config))) found['claude-desktop'] = { config };
  return found;
}

/** The steps setup would take, in order. Each either runs one of the agent's own commands or rewrites one file. */
export function planFor(found, { source = DEFAULT_SOURCE, server = serverCommand() } = {}) {
  const steps = [];
  const claude = found['claude-code'];
  if (claude) {
    if (!claude.marketplace) steps.push({ agent: 'claude-code', what: 'Add the Finnomena marketplace', command: ['claude', 'plugin', 'marketplace', 'add', source] });
    else steps.push({ agent: 'claude-code', what: 'Refresh the Finnomena marketplace', command: ['claude', 'plugin', 'marketplace', 'update', MARKETPLACE] });
    steps.push(claude.plugin
      ? { agent: 'claude-code', what: 'Update the neon plugin (the five skills and the finno tools)', command: ['claude', 'plugin', 'update', PLUGIN] }
      : { agent: 'claude-code', what: 'Install the neon plugin (the five skills and the finno tools)', command: ['claude', 'plugin', 'install', PLUGIN] });
  }
  const codex = found.codex;
  if (codex) {
    if (!codex.marketplace) steps.push({ agent: 'codex', what: 'Add the Finnomena marketplace', command: ['codex', 'plugin', 'marketplace', 'add', source] });
    steps.push({ agent: 'codex', what: 'Install the neon plugin (the five skills)', command: ['codex', 'plugin', 'add', PLUGIN] });
    if (codex.server) steps.push({ agent: 'codex', what: 'Remove the finno tools registered before', command: ['codex', 'mcp', 'remove', 'finno'] });
    const env = Object.entries(server.env).flatMap(([key, value]) => ['--env', `${key}=${value}`]);
    steps.push({ agent: 'codex', what: 'Register the finno tools', command: ['codex', 'mcp', 'add', 'finno', ...env, '--', server.command, ...server.args] });
  }
  const desktop = found['claude-desktop'];
  if (desktop) {
    const entry = { command: server.command, args: server.args, ...(Object.keys(server.env).length ? { env: server.env } : {}) };
    steps.push({ agent: 'claude-desktop', what: 'Register the finno tools, keeping a backup of the file beside it', file: desktop.config, entry });
  }
  return steps;
}

const quoted = argument => (/^[\w@%+=:,./-]+$/.test(argument) ? argument : `'${argument.replaceAll("'", "'\\''")}'`);

export function describePlan(found, steps, { published }) {
  const lines = [`finno ${VERSION} setup`, ''];
  for (const agent of AGENTS) {
    const own = steps.filter(step => step.agent === agent);
    if (!found[agent]) { lines.push(`${NAMES[agent]}: not found on this computer, so nothing to do.`, ''); continue; }
    lines.push(`${NAMES[agent]}:`);
    for (const step of own) {
      lines.push(`  ${steps.indexOf(step) + 1}. ${step.what}`);
      lines.push(step.command ? `     ${step.command.map(quoted).join(' ')}` : `     ${step.file}\n     mcpServers.finno = ${JSON.stringify(step.entry)}`);
    }
    if (agent === 'claude-desktop') {
      lines.push('  Only the tools reach Claude Desktop this way. Its skills come from your organization\'s plugin',
        '  marketplace, or from a plugin file: run setup with --plugin-zip <directory> and upload the file it writes.');
    }
    lines.push('');
  }
  if (!published) lines.push('This is a checkout of Neon, not the published package, so the tools are registered to run from this directory.', '');
  lines.push('Afterwards setup starts the tool server and checks that its three tools answer.');
  return lines.join('\n');
}

async function applyFile(step) {
  let config = {};
  if (existsSync(step.file)) {
    const text = await readFile(step.file, 'utf8');
    try {
      config = text.trim() ? JSON.parse(text) : {};
    } catch {
      throw new Error(`${step.file} is not valid JSON, so it was left as it is. Fix or remove it and run setup again.`);
    }
    if (typeof config !== 'object' || config === null || Array.isArray(config)) throw new Error(`${step.file} does not hold a settings object, so it was left as it is.`);
    const backup = `${step.file}.finno-backup-${new Date().toISOString().replace(/[:.]/g, '-')}`;
    await copyFile(step.file, backup);
    step.backup = backup;
  }
  config.mcpServers = { ...config.mcpServers, finno: step.entry };
  await mkdir(dirname(step.file), { recursive: true });
  await writeFile(step.file, `${JSON.stringify(config, null, 2)}\n`);
}

/** Starts the tool server as an agent would and checks that it lists its tools and answers `options`. */
export function selfTest({ command = process.execPath, args = [join(NEON_ROOT, 'scripts/finno.mjs'), 'mcp'], timeoutMs = 60_000 } = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    const answers = new Map();
    let buffer = '';
    let errors = '';
    const timer = setTimeout(() => { child.kill(); reject(new Error(`The tool server did not answer in ${timeoutMs / 1000} s.`)); }, timeoutMs);
    child.stderr.on('data', chunk => { errors += chunk; });
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.stdout.on('data', chunk => {
      buffer += chunk;
      let newline;
      while ((newline = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        try { const message = JSON.parse(line); answers.set(message.id, message); } catch { /* not a message */ }
      }
      if (answers.has(3)) child.stdin.end();
    });
    child.on('close', () => {
      clearTimeout(timer);
      try {
        const tools = answers.get(2)?.result?.tools?.map(tool => tool.name) ?? [];
        const options = answers.get(3)?.result;
        if (!answers.get(1)?.result?.serverInfo) throw new Error('it did not answer initialize');
        if (tools.join() !== 'options,candidates,render') throw new Error(`it listed ${tools.join(', ') || 'no tools'}`);
        if (!options || options.isError) throw new Error(`options failed: ${options?.content?.[0]?.text ?? 'no answer'}`);
        const { formats, colourways } = JSON.parse(options.content[0].text);
        resolvePromise({ tools, formats: formats.length, colourways: colourways.length });
      } catch (error) {
        reject(new Error(`The tool server started but ${error.message}.${errors ? `\n${errors.trim()}` : ''}`));
      }
    });
    const send = message => child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', ...message })}\n`);
    send({ id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'finno-setup', version: VERSION } } });
    send({ method: 'notifications/initialized' });
    send({ id: 2, method: 'tools/list' });
    send({ id: 3, method: 'tools/call', params: { name: 'options', arguments: {} } });
  });
}

/** Writes the plugin as one file an Owner or an employee can upload where the marketplace cannot be reached. */
export async function writePluginZip(directory) {
  const { packagePlugin } = await import('../../package-plugin.mjs');
  const { zipDirectory } = await import('./zip.mjs');
  const staging = await mkdtemp(join(tmpdir(), 'finno-plugin-'));
  await packagePlugin({ sourceRoot: NEON_ROOT, destination: staging });
  const file = join(resolve(directory), `neon-${VERSION}.zip`);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, await zipDirectory(staging));
  await rm(staging, { recursive: true, force: true });
  return file;
}

function parse(argv) {
  const flags = { yes: false, agents: AGENTS, source: DEFAULT_SOURCE, zip: null };
  for (let index = 0; index < argv.length; index++) {
    const flag = argv[index];
    if (flag === '--yes' || flag === '-y') flags.yes = true;
    else if (flag === '--agent') flags.agents = (argv[++index] ?? '').split(',').filter(Boolean);
    else if (flag === '--source') flags.source = argv[++index];
    else if (flag === '--plugin-zip') flags.zip = argv[index + 1] && !argv[index + 1].startsWith('--') ? argv[++index] : '.';
    else throw new Error(`finno setup takes no ${flag}. It takes --yes, --agent <${AGENTS.join(',')}>, --source <repository or path> and --plugin-zip [directory].`);
  }
  const unknown = flags.agents.filter(agent => !AGENTS.includes(agent));
  if (unknown.length || !flags.source) throw new Error(`--agent takes any of ${AGENTS.join(', ')}, and --source a repository or a path.`);
  return flags;
}

const ask = question => new Promise(answer => {
  const reader = createInterface({ input: process.stdin, output: process.stdout });
  reader.question(question, reply => { reader.close(); answer(/^y(es)?$/i.test(reply.trim())); });
});

/** Runs setup. Returns the exit code: 0 when the plan was shown or applied and verified, 1 when a step failed. */
export async function setup(argv, { run = defaultRun, log = console.log, interactive = process.stdin.isTTY && process.stdout.isTTY, test = selfTest, ...where } = {}) {
  let flags;
  try { flags = parse(argv); } catch (error) { log(error.message); return 1; }
  if (flags.zip) {
    const file = await writePluginZip(flags.zip);
    log(`Wrote the neon plugin to ${file}\nUpload it where plugins are added in Claude Desktop, or give it to your organization's Owner.`);
    return 0;
  }
  const all = detect({ run, ...where });
  const found = Object.fromEntries(Object.entries(all).filter(([agent]) => flags.agents.includes(agent)));
  const server = serverCommand(where);
  const steps = planFor(found, { source: flags.source, server });
  log(describePlan(found, steps, server));
  if (!steps.length) { log('\nNo agent that finno can set up was found. Install Claude Code, Codex or Claude Desktop first.'); return 1; }
  if (!flags.yes) {
    if (!interactive) { log(`\nNothing has been changed. To apply this plan, run setup again with --yes.`); return 0; }
    if (!await ask('\nApply this plan? [y/N] ')) { log('Nothing has been changed.'); return 0; }
  }

  log('');
  const failed = new Set();
  for (const step of steps) {
    const label = `${steps.indexOf(step) + 1}. ${NAMES[step.agent]}: ${step.what}`;
    if (failed.has(step.agent)) { log(`- ${label}: skipped, an earlier step for ${NAMES[step.agent]} failed.`); continue; }
    try {
      if (step.command) {
        const result = run(step.command[0], step.command.slice(1));
        if (!result.ok) throw new Error(result.output.trim() || 'the command failed');
      } else {
        await applyFile(step);
      }
      log(`✔ ${label}${step.backup ? `\n  Backup: ${step.backup}` : ''}`);
    } catch (error) {
      failed.add(step.agent);
      log(`✖ ${label}\n  ${error.message.split('\n').join('\n  ')}`);
    }
  }

  let verified = true;
  try {
    const { tools, formats, colourways } = await test();
    log(`✔ The tool server answers: ${tools.join(', ')} (${formats} Formats, ${colourways} Colourways).`);
  } catch (error) {
    verified = false;
    log(`✖ ${error.message}`);
  }
  const after = detect({ run, ...where });
  if (found['claude-code'] && !failed.has('claude-code')) {
    const ok = after['claude-code']?.plugin;
    if (!ok) verified = false;
    log(ok ? '✔ Claude Code lists the neon plugin. Start a new session to use it.' : '✖ Claude Code does not list the neon plugin.');
  }
  if (found.codex && !failed.has('codex')) {
    const ok = after.codex?.server;
    if (!ok) verified = false;
    log(ok ? '✔ Codex lists the finno tools. Start a new session to use them.' : '✖ Codex does not list the finno tools.');
  }
  if (found['claude-desktop'] && !failed.has('claude-desktop')) log('✔ Claude Desktop: quit and reopen it to load the finno tools.');
  if (failed.size || !verified) { log('\nSetup did not finish. The steps marked ✖ say why; the others were applied.'); return 1; }
  log('\nDone. Try: "Make a Finnomena story ad that says Invest every month."');
  return 0;
}
