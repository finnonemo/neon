#!/usr/bin/env node
// Lists the commands denied in a Claude Code eval run and flags a run that
// then reports the shell as blocked: agents read one denied command as the
// whole shell being unavailable, so that run is void, not a result.
//
//   node evals/skills/check-run.mjs <run.jsonl>...
//
// Input is `claude -p --output-format stream-json` output. Exits 1 when any
// run is void.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const BLOCKED_SHELL = /\b(shell|bash|terminal)\b[^.\n]{0,40}\b(blocked|denied|unavailable|disabled)\b|\b(blocked|denied)\b[^.\n]{0,20}\b(shell|bash)\b/i;

export function checkRun(jsonl) {
  const uses = new Map();
  const denied = [];
  let blockedClaim = null;
  for (const line of jsonl.split('\n')) {
    let event;
    // A run stopped at its cap can end mid-line.
    try { event = JSON.parse(line); } catch { continue; }
    if (event.type === 'assistant') {
      for (const part of event.message?.content ?? []) {
        if (part.type === 'tool_use') uses.set(part.id, part);
        if (part.type === 'text' && denied.length && !blockedClaim) blockedClaim = part.text.match(BLOCKED_SHELL)?.[0] ?? null;
      }
    }
    if (event.type === 'system' && event.subtype === 'permission_denied') {
      const use = uses.get(event.tool_use_id);
      denied.push({ tool: event.tool_name, command: use?.input?.command ?? null });
    }
  }
  return { denied, blockedClaim, void: Boolean(blockedClaim) };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const files = process.argv.slice(2);
  if (!files.length) {
    console.error('Usage: check-run.mjs <run.jsonl>...');
    process.exit(2);
  }
  for (const file of files) {
    const result = checkRun(readFileSync(file, 'utf8'));
    console.log(`${result.void ? 'VOID' : 'ok'}  ${file}`);
    for (const { tool, command } of result.denied) console.log(`  denied ${tool}: ${command ?? '(no command)'}`);
    if (result.blockedClaim) console.log(`  reported "${result.blockedClaim}" after a denial`);
    if (result.void) process.exitCode = 1;
  }
}
