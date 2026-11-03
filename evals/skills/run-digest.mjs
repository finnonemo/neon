#!/usr/bin/env node
// Prints what a Claude Code eval run did, from its run.jsonl, for grading: each
// Bash command, Read and Skill target, and Edit and Write path in order, then
// the last `result` event's text and the run's cost. reference-reads.mjs does
// the same job for Codex runs.
//
//   node evals/skills/run-digest.mjs <case-dir>...
//
// Input is `claude -p --output-format stream-json` output. `total_cost_usd` is
// cumulative, so the last result's cost covers every turn.
import { readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const TARGETS = { Bash: 'command', Read: 'file_path', Skill: 'skill', Edit: 'file_path', Write: 'file_path' };

export function parseRun(jsonl) {
  // A run stopped at its cap can end mid-line.
  return jsonl.split('\n').flatMap(line => { try { return [JSON.parse(line)]; } catch { return []; } });
}

export function digest(events) {
  const steps = [];
  const results = events.filter(event => event.type === 'result');
  for (const event of events) {
    if (event.type !== 'assistant') continue;
    for (const part of event.message?.content ?? []) {
      if (part.type === 'tool_use' && part.name in TARGETS) steps.push([part.name.toLowerCase(), part.input?.[TARGETS[part.name]] ?? '']);
    }
  }
  const last = results.at(-1);
  return { steps, results: results.length, result: last?.result ?? null, costUsd: last?.total_cost_usd ?? null };
}

const indent = (text, prefix) => text.split('\n').join(`\n${prefix}`);

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const cases = process.argv.slice(2);
  if (!cases.length) {
    console.error('Usage: node evals/skills/run-digest.mjs <case-dir>...');
    process.exitCode = 2;
  }
  for (const caseDirectory of cases) {
    const run = digest(parseRun(await readFile(join(caseDirectory, 'run.jsonl'), 'utf8')));
    const cost = run.costUsd === null ? 'no result' : `$${run.costUsd.toFixed(2)}  ${run.results} result${run.results === 1 ? '' : 's'}`;
    console.log(`${basename(caseDirectory)}  ${cost}`);
    for (const [tool, target] of run.steps) console.log(`  ${tool.padEnd(6)} ${indent(target, ' '.repeat(9))}`);
    if (run.result !== null) console.log(`  result\n    ${indent(run.result, '    ')}`);
  }
}
