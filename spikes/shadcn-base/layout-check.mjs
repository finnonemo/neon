// PROTOTYPE (spike): pane geometry per width, plus the compact pane toggle.
import { createRequire } from 'node:module';
const require = createRequire(process.argv[2] + '/');
const { chromium } = require('@playwright/test');
const [, , , url, shotPrefix] = process.argv;
const browser = await chromium.launch();
const out = {};
for (const w of [375, 768, 1024, 1280, 1440, 1920]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(url); await page.waitForLoadState('networkidle');
  const geo = () => page.evaluate(() => {
    const secs = [...document.querySelectorAll('section')].map(s => ({ label: s.getAttribute('aria-label'), w: Math.round(s.getBoundingClientRect().width), hidden: s.hidden }));
    const shell = document.querySelector('.neon-layout');
    const sidebar = shell?.firstElementChild?.tagName === 'DIV' ? Math.round(shell.firstElementChild.getBoundingClientRect().width) : 0;
    const bottom = document.querySelector('nav[aria-label="Primary navigation"]');
    return { sidebar, panes: secs.map(s => `${s.label}:${s.hidden ? 'hidden' : s.w}`).join(' '), bottomNav: bottom ? Math.round(bottom.getBoundingClientRect().height) : 0, overflowX: document.documentElement.scrollWidth > innerWidth };
  });
  out[w] = await geo();
  if (w === 375) {
    await page.screenshot({ path: `${shotPrefix}-375.png`, fullPage: false });
    await page.getByRole('button', { name: 'View details' }).click();
    out['375 after View details'] = { ...(await geo()), focus: await page.evaluate(() => document.activeElement?.getAttribute('aria-label')) };
    await page.screenshot({ path: `${shotPrefix}-375-details.png` });
    await page.getByRole('button', { name: 'Back to content' }).click();
    out['375 after Back'] = { ...(await geo()), focus: await page.evaluate(() => document.activeElement?.textContent?.trim()) };
  }
  await page.close();
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
