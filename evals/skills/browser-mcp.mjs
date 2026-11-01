#!/usr/bin/env node
// Evaluator-only stdio MCP server giving an agent a headless browser tool with a
// JavaScript evaluate action, like a desktop browser pane. run-claude-case.mjs
// passes it to Claude Code eval runs; screenshots come back as MCP image content.
//   claude --mcp-config '{"mcpServers":{"browser":{"command":"node","args":["<this file>"]}}}'
//
// Every call is capped (NEON_EVAL_BROWSER_TIMEOUT_MS, default 60000): an evaluate
// awaiting a promise that never settles once stalled a run until its 45-minute
// cap. A capped call returns an error and the next call proceeds.
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { pathToFileURL } from 'node:url';

const repo = resolve(import.meta.dirname, '../..');

export const tools = [
  { name: 'navigate', description: 'Open a URL in the browser tab.', inputSchema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] } },
  { name: 'resize', description: 'Set the viewport size in CSS pixels.', inputSchema: { type: 'object', properties: { width: { type: 'number' }, height: { type: 'number' } }, required: ['width', 'height'] } },
  { name: 'evaluate', description: 'Evaluate a JavaScript expression in the page and return its JSON-serialized result. A promise that does not settle within the time limit returns an error.', inputSchema: { type: 'object', properties: { expression: { type: 'string' } }, required: ['expression'] } },
  { name: 'screenshot', description: 'Take a PNG screenshot of the viewport.', inputSchema: { type: 'object', properties: { fullPage: { type: 'boolean' } } } },
  { name: 'console', description: 'Return console messages and page errors since the tab opened.', inputSchema: { type: 'object', properties: {} } },
];

// Settles with `promise`, or rejects once `ms` pass; the losing promise is left to settle on its own.
export function withTimeout(promise, ms, label) {
  let timer;
  const limit = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`${label} did not finish within ${ms / 1000}s; the call was abandoned and the browser is still usable.`)), ms); });
  return Promise.race([promise, limit]).finally(() => clearTimeout(timer));
}

export function createServer({ timeoutMs = Number(process.env.NEON_EVAL_BROWSER_TIMEOUT_MS) || 60_000, launch } = {}) {
  let browser, page;
  const messages = [];
  launch ??= () => createRequire(join(repo, 'evals/templates/package.json'))('@playwright/test').chromium.launch();
  const ensure = async () => {
    browser ??= await launch();
    if (!page) {
      page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      page.on('console', message => messages.push(`${message.type()}: ${message.text()}`));
      page.on('pageerror', error => messages.push(`pageerror: ${error.message}`));
    }
    return page;
  };
  const call = async (name, args) => {
    const tab = await ensure();
    if (name === 'navigate') { await tab.goto(args.url, { waitUntil: 'networkidle', timeout: timeoutMs }); return [{ type: 'text', text: `Opened ${tab.url()}` }]; }
    if (name === 'resize') { await tab.setViewportSize({ width: args.width, height: args.height }); return [{ type: 'text', text: `Viewport ${args.width}x${args.height}` }]; }
    if (name === 'evaluate') { const value = await withTimeout(tab.evaluate(args.expression), timeoutMs, 'evaluate'); return [{ type: 'text', text: JSON.stringify(value, null, 2) ?? 'undefined' }]; }
    if (name === 'screenshot') { const png = await tab.screenshot({ fullPage: !!args.fullPage, timeout: timeoutMs }); return [{ type: 'image', data: png.toString('base64'), mimeType: 'image/png' }]; }
    if (name === 'console') return [{ type: 'text', text: messages.join('\n') || '(none)' }];
    throw new Error(`Unknown tool ${name}`);
  };
  // One JSON-RPC request in, its response out (undefined for notifications).
  const handle = async ({ id, method, params }) => {
    if (id === undefined) return undefined;
    try {
      if (method === 'initialize') return { id, result: { protocolVersion: params.protocolVersion, capabilities: { tools: {} }, serverInfo: { name: 'browser', version: '0.0.1' } } };
      if (method === 'tools/list') return { id, result: { tools } };
      if (method === 'tools/call') return { id, result: { content: await withTimeout(call(params.name, params.arguments ?? {}), timeoutMs + 5_000, params.name) } };
      return { id, error: { code: -32601, message: `Method not found: ${method}` } };
    } catch (error) {
      return { id, result: { content: [{ type: 'text', text: String(error.message ?? error) }], isError: true } };
    }
  };
  return { handle, close: () => browser?.close() };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const server = createServer();
  const send = message => process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', ...message })}\n`);
  let queue = Promise.resolve();
  createInterface({ input: process.stdin }).on('line', line => {
    if (!line.trim()) return;
    queue = queue.then(async () => { const response = await server.handle(JSON.parse(line)); if (response) send(response); });
  });
  process.stdin.on('end', async () => { await queue; await server.close(); process.exit(0); });
}
