#!/usr/bin/env node
// Lists the skill files, then the Core snapshot files (`core/…`), each Codex or
// Claude case read, from its run.jsonl. A command
// can name a file without printing it (`rg -g`, a failed path) or read several
// through brace expansion (`references/{rebuild,scaffold}.md`), so a name in a
// command is not a read. Each file counts as read by the share of its lines
// that appear in the command's output.
//
//   node evals/skills/reference-reads.mjs <case-dir>...
import { readFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SKILL_TOKEN = /[^\s'"`\\;|&<>()]*skills\/[^\s'"`\\;|&<>()]*/g;
const CORE_TOKEN = /[^\s'"`\\;|&<>()]*core\/[^\s'"`\\;|&<>()]*\.(?:md|json)/g;

export function expandBraces(token) {
  const open = token.indexOf('{');
  if (open === -1) return [token];
  let depth = 0;
  const options = [];
  let start = open + 1;
  for (let index = open; index < token.length; index++) {
    if (token[index] === '{') depth++;
    else if (token[index] === '}' && --depth === 0) {
      options.push(token.slice(start, index));
      const [prefix, suffix] = [token.slice(0, open), token.slice(index + 1)];
      return options.flatMap(option => expandBraces(prefix + option + suffix));
    } else if (token[index] === ',' && depth === 1) {
      options.push(token.slice(start, index));
      start = index + 1;
    }
  }
  return [token];
}

// Markdown paths under a `skills/` directory that a shell command names.
export function skillPaths(command) {
  return [...new Set((command.match(SKILL_TOKEN) ?? []).flatMap(expandBraces).filter(path => path.endsWith('.md')))];
}

// Share of the file's distinctive lines (20+ characters) present in the output.
export function coverage(text, output) {
  const lines = [...new Set(text.split('\n').map(line => line.trim()).filter(line => line.length >= 20))];
  if (!lines.length) return output.includes(text.trim()) ? 1 : 0;
  return lines.filter(line => output.includes(line)).length / lines.length;
}

const resultText = content => (typeof content === 'string' ? content : (content ?? []).map(part => part.text ?? '').join('\n'));

// Each command and its output: Codex logs both in one completed item; Claude
// logs a Read or Bash tool_use and, in a later event, its tool_result.
export function commandOutputs(events) {
  const pending = new Map();
  const commands = [];
  for (const event of events) {
    const item = event.item;
    if (event.type === 'item.completed' && item?.type === 'command_execution') commands.push({ command: item.command, output: item.aggregated_output ?? '' });
    for (const part of event.message?.content ?? []) {
      if (part.type === 'tool_use' && part.name === 'Read') pending.set(part.id, part.input.file_path);
      if (part.type === 'tool_use' && part.name === 'Bash') pending.set(part.id, part.input.command);
      if (part.type === 'tool_result' && pending.has(part.tool_use_id)) commands.push({ command: pending.get(part.tool_use_id), output: resultText(part.content) });
    }
  }
  return commands;
}

// Best coverage per file a command names. `pathsIn` picks the paths from a
// command; `locate` gives a path's key in the listing and its copy in this repository.
async function bestCoverage(commands, read, pathsIn, locate) {
  const files = new Map();
  for (const item of commands) {
    for (const path of pathsIn(item.command)) {
      const { key, repo } = locate(path);
      // Prefer the copy the run installed; fall back to this repository's.
      let text;
      let source = 'installed';
      try {
        text = await read(path);
      } catch {
        source = 'repo';
        try {
          text = await read(repo);
        } catch {
          continue;
        }
      }
      const share = coverage(text, item.output);
      const entry = files.get(key) ?? { file: key, coverage: 0, commands: 0, source };
      entry.commands++;
      if (share > entry.coverage) Object.assign(entry, { coverage: share, source });
      files.set(key, entry);
    }
  }
  return [...files.values()].sort((a, b) => a.file.localeCompare(b.file));
}

// Best coverage per skill file, keyed by its path below `skills/`.
export function referenceReads(events, read = path => readFile(path, 'utf8')) {
  return bestCoverage(commandOutputs(events), read, skillPaths, path => {
    const key = path.slice(path.lastIndexOf('skills/') + 'skills/'.length);
    return { key, repo: join(repoRoot, 'skills', key) };
  });
}

// Best coverage per Core snapshot file, keyed from `core/`. The snapshot is the
// `core/` beside the `skills/` directory the run read from, so an app's own
// `src/core/` is not one.
export function coreReads(events, read = path => readFile(path, 'utf8')) {
  const commands = commandOutputs(events);
  const roots = new Set(commands.flatMap(item => item.command.match(SKILL_TOKEN) ?? []).map(path => path.slice(0, path.lastIndexOf('skills/'))));
  const pathsIn = command => [...new Set((command.match(CORE_TOKEN) ?? []).flatMap(expandBraces).filter(path => roots.has(path.slice(0, path.lastIndexOf('core/')))))];
  return bestCoverage(commands, read, pathsIn, path => {
    const key = path.slice(path.lastIndexOf('core/'));
    return { key, repo: join(repoRoot, key) };
  });
}

export const status = share => (share >= 0.9 ? 'read' : share > 0 ? 'partial' : 'named only');

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const cases = process.argv.slice(2);
  if (!cases.length) {
    console.error('Usage: node evals/skills/reference-reads.mjs <case-dir>...');
    process.exitCode = 2;
  }
  for (const caseDirectory of cases) {
    const log = await readFile(join(caseDirectory, 'run.jsonl'), 'utf8');
    const events = log.split('\n').filter(Boolean).map(line => JSON.parse(line));
    console.log(basename(caseDirectory));
    for (const entry of [...await referenceReads(events), ...await coreReads(events)]) {
      // A repo copy may differ from what the run installed.
      const note = entry.source === 'repo' ? ' (repo copy)' : '';
      console.log(`  ${status(entry.coverage).padEnd(10)} ${String(Math.round(entry.coverage * 100)).padStart(3)}%  ${entry.file}${note}`);
    }
  }
}
