// Claude Code, run headless for one prompt library entry: no tools, no MCP servers, no project or user
// settings and no saved session, from an empty folder, so the answer depends only on the prompt. The
// executable is CLAUDE_PATH, else `claude` on PATH; tests point CLAUDE_PATH at a fake.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const MODEL = 'claude-opus-5-5';
export const EFFORT = 'high';
const TIMEOUT = 10 * 60 * 1000;

// Claude Code could not answer: not signed in, missing, timed out or crashed. Never counts as an attempt.
export class ClaudeError extends Error {}

const firstLine = (text) => String(text).trim().split('\n')[0];

function call(claude, args, input) {
  const cwd = mkdtempSync(join(tmpdir(), 'neon-theme-brief-'));
  try {
    const result = spawnSync(claude, args, { cwd, input, encoding: 'utf8', timeout: TIMEOUT, maxBuffer: 64 * 1024 * 1024 });
    if (result.error?.code === 'ENOENT') throw new ClaudeError('Claude Code was not found; install it or set CLAUDE_PATH');
    if (result.error?.code === 'ETIMEDOUT') throw new ClaudeError(`Claude Code gave no answer in ${TIMEOUT / 60000} minutes`);
    if (result.error) throw new ClaudeError(`Claude Code could not run (${result.error.code ?? result.error.message})`);
    if (result.status !== 0) throw new ClaudeError(`Claude Code exited with ${result.status}: ${firstLine(result.stderr || result.stdout)}`);
    return result.stdout;
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

// The version Claude Code reports, such as "2.1.316".
export const claudeVersion = (claude) => firstLine(call(claude, ['--version'])).split(/\s+/)[0];

// One answer: { answer } parsed from the structured output, or { problem } when it is not JSON.
export function askClaude({ claude, model, system, schema, prompt }) {
  const stdout = call(claude, [
    '-p', '--model', model, '--effort', EFFORT, '--tools', '', '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}',
    '--setting-sources', 'local', '--no-session-persistence', '--system-prompt', system,
    '--output-format', 'json', '--json-schema', JSON.stringify(schema),
  ], prompt);
  let result;
  try {
    result = JSON.parse(stdout);
  } catch {
    throw new ClaudeError('Claude Code printed no JSON result');
  }
  if (result.is_error) throw new ClaudeError(`Claude Code reported an error: ${firstLine(result.result ?? '')}`);
  if (result.structured_output !== undefined) return { answer: result.structured_output };
  try {
    return { answer: JSON.parse(result.result) };
  } catch {
    return { problem: 'the answer is not JSON' };
  }
}
