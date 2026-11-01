import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer, tools } from './browser-mcp.mjs';

// A stand-in browser whose evaluate never settles, as a page awaiting a timer that never fires.
const stalledBrowser = async () => ({
  newPage: async () => ({
    on() {},
    url: () => 'http://localhost/',
    evaluate: () => new Promise(() => {}),
    setViewportSize: async () => {},
  }),
  close: async () => {},
});

test('lists the five browser tools', async () => {
  const server = createServer({ launch: stalledBrowser });
  const response = await server.handle({ id: 1, method: 'tools/list' });
  assert.deepEqual(response.result.tools.map(tool => tool.name), tools.map(tool => tool.name));
  assert.deepEqual(tools.map(tool => tool.name), ['navigate', 'resize', 'evaluate', 'screenshot', 'console']);
});

test('an evaluate that never settles returns an error in time, and the next call still works', async () => {
  const server = createServer({ launch: stalledBrowser, timeoutMs: 50 });
  const started = Date.now();
  const stalled = await server.handle({ id: 2, method: 'tools/call', params: { name: 'evaluate', arguments: { expression: 'new Promise(() => {})' } } });
  assert.ok(Date.now() - started < 2_000);
  assert.equal(stalled.result.isError, true);
  assert.match(stalled.result.content[0].text, /evaluate did not finish within 0.05s/);
  const next = await server.handle({ id: 3, method: 'tools/call', params: { name: 'resize', arguments: { width: 375, height: 812 } } });
  assert.equal(next.result.content[0].text, 'Viewport 375x812');
});

test('notifications get no response', async () => {
  const server = createServer({ launch: stalledBrowser });
  assert.equal(await server.handle({ method: 'notifications/initialized' }), undefined);
});
