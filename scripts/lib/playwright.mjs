// The Playwright that evals/templates installs, for the scripts that open a browser outside the browser suite.
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const INSTALL = 'npm ci --prefix evals/templates && npx --prefix evals/templates playwright install chromium';

/** Playwright's chromium, or null when evals/templates has no install. */
export async function loadChromium() {
  try {
    const entry = createRequire(fileURLToPath(new URL('../../evals/templates/package.json', import.meta.url))).resolve('@playwright/test');
    const playwright = await import(pathToFileURL(entry).href);
    // A CommonJS package: named exports may sit only on the default export.
    return playwright.chromium ?? playwright.default.chromium;
  } catch {
    return null;
  }
}
