import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Each Immersive Theme on the Neon base's ImmersiveLayout (#96). Expected
// colors come from the generated theme CSS, so the page is held to the themes
// a Campaign Page copies, not to values restated here.
test.skip((process.env.NEON_TARGET ?? 'cds') !== 'neon', 'The Neon base only; the CDS starter takes no immersiveTheme');
test.beforeEach(async ({ page }) => {
  page.on('pageerror', error => { throw error; });
  page.on('console', message => { if (message.type() === 'error') throw new Error(message.text()); });
});

const css = readFileSync(new URL('../../theme/css/immersive-themes.css', import.meta.url), 'utf8');
const rgb = hex => `rgb(${hex.slice(1).match(/../g).map(v => parseInt(v, 16)).join(', ')})`;
const themeVars = name => {
  const body = css.match(new RegExp(`\\[data-immersive-theme="${name}"\\]\\s*\\{([^}]*)\\}`))[1];
  return Object.fromEntries([...body.matchAll(/--immersive-([\w-]+):\s*(#[0-9a-f]{6})/g)].map(([, key, hex]) => [key, hex]));
};
// The ticket's rule: only Ultra's navy canvas is dark.
const SCHEMES = { club: 'light', exclusive: 'light', private: 'light', ultra: 'dark' };

for (const [theme, scheme] of Object.entries(SCHEMES)) {
  const vars = themeVars(theme);
  for (const os of ['light', 'dark']) {
    test(`${theme} under OS ${os}: canvas, text, action, focus ring, logo and color-scheme follow the theme`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      // The logo fixture shows the light-surface logo, and the dark one under mode=dark.
      const logos = page.getByRole('img', { name: 'Finnomena', exact: true });
      await page.goto(`/?layout=logo${scheme === 'dark' ? '&mode=dark' : ''}`);
      const toned = await logos.first().getAttribute('src');

      await page.emulateMedia({ colorScheme: os });
      await page.goto(`/?layout=immersive&theme=${theme}`);
      const layout = page.locator('.neon-layout');
      await expect(layout).toHaveAttribute('data-immersive-theme', theme);
      await expect(layout).toHaveCSS('background-color', rgb(vars.canvas));
      await expect(layout).toHaveCSS('color', rgb(vars.text));
      await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('color', rgb(vars.text));
      await page.screenshot({ path: test.info().outputPath(`immersive-${theme}-os-${os}.png`) });

      const action = page.getByRole('button', { name: 'Final action' });
      await expect(action).toHaveCSS('background-color', rgb(vars.action));
      await expect(action).toHaveCSS('color', rgb(vars['on-action']));
      await page.getByRole('button', { name: /^Request 24 / }).focus();
      await page.keyboard.press('Tab');
      await expect(action).toBeFocused();
      // The Button draws its ring in --ring at 50%, transitioning in: the shadow must settle on the theme action at 50%.
      const ring = await page.evaluate(hex => {
        const probe = document.createElement('i');
        probe.style.color = `color-mix(in oklab, ${hex} 50%, transparent)`;
        document.body.append(probe);
        const value = getComputedStyle(probe).color;
        probe.remove();
        return value;
      }, vars.action);
      await expect.poll(() => action.evaluate(el => getComputedStyle(el).boxShadow), { message: 'the focus ring is drawn in the theme action' }).toContain(`${ring} 0px 0px 0px 3px`);

      await expect(logos.first()).toHaveAttribute('src', toned);
      for (const element of ['html', 'body']) {
        expect(await page.evaluate(selector => getComputedStyle(document.querySelector(selector)).colorScheme, element), `${element} color-scheme`).toBe(scheme);
      }
    });
  }

  test(`${theme}: the page scrolls with the window and overscroll shows the canvas`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`/?layout=immersive&theme=${theme}`);
    for (const element of ['html', 'body']) await expect(page.locator(element)).toHaveCSS('background-color', rgb(vars.canvas));
    const action = page.getByRole('button', { name: 'Final action' });
    // No element between the content and the window scrolls on its own.
    expect(await action.evaluate(el => {
      const scrollers = [];
      for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
        if (/auto|scroll|hidden/.test(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight) scrollers.push(node.className || node.tagName);
      }
      return scrollers;
    })).toEqual([]);
    expect(await page.evaluate(() => document.scrollingElement.scrollHeight > innerHeight)).toBe(true);
    await action.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
    await expect(action).toBeInViewport();
    await page.screenshot({ path: test.info().outputPath(`immersive-${theme}-375-scrolled.png`) });
  });
}

// The themed page keeps the starter's full-bleed content and its 1440px cap at max.
for (const width of [1919, 1920]) {
  test(`ultra ${width}px: content stays full-bleed below max and capped at max`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/?layout=immersive&theme=ultra');
    const box = await page.locator('.neon-immersive-content').boundingBox();
    const expected = width >= 1920 ? 1440 : width;
    expect(box.width).toBe(expected);
    expect(box.x).toBe((width - expected) / 2);
  });
}
