import { defineConfig } from '@playwright/test';
import { join, resolve } from 'node:path';

if (!process.env.NEON_TEST_APP) throw new Error('Run npm test to assemble the disposable app first.');
const artifacts = resolve('../../.local/evals/templates');
export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.mjs',
  outputDir: join(artifacts, 'test-results'),
  reporter: [['list'], ['html', { outputFolder: join(artifacts, 'report'), open: 'never' }]],
  workers: 2,
  fullyParallel: true,
  maxFailures: 5,
  retries: 0,
  use: { baseURL: 'http://127.0.0.1:4178', browserName: 'chromium', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4178 --strictPort',
    cwd: process.env.NEON_TEST_APP,
    url: 'http://127.0.0.1:4178',
    reuseExistingServer: false,
  },
});
