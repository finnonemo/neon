import { defineConfig } from '@playwright/test';
import { join, resolve } from 'node:path';

if (!process.env.NEON_TEST_APP || !process.env.NEON_TEMPLATE_PORT) throw new Error('Run npm test to assemble the disposable app first.');
// One folder per target: Playwright clears its output and report folders at the
// start of a run, so a shared folder would lose the first target's results.
const artifacts = resolve('../../.local/evals/templates', process.env.NEON_TARGET ?? 'neon');
// run.mjs passes the preview's port: a free one, or the NEON_TEMPLATE_PORT it was given.
const port = Number(process.env.NEON_TEMPLATE_PORT);
export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.mjs',
  outputDir: join(artifacts, 'test-results'),
  reporter: [['list'], ['html', { outputFolder: join(artifacts, 'report'), open: 'never' }]],
  workers: 2,
  fullyParallel: true,
  maxFailures: 5,
  retries: 0,
  use: { baseURL: `http://127.0.0.1:${port}`, browserName: 'chromium', trace: 'retain-on-failure' },
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port ${port} --strictPort`,
    cwd: process.env.NEON_TEST_APP,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
  },
});
