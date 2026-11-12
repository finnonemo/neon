import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Each Immersive Theme on the Neon base's ImmersiveLayout (#96). Expected
// colors come from the generated theme CSS, so the page is held to the themes
// a Campaign Page copies; the color schemes are the ticket's rule.
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
// Each color as the page resolves it, from an element in the body, where portalled overlays sit.
const resolve = (page, colors) => page.evaluate(entries => Object.fromEntries(entries.map(([name, value]) => {
  const probe = document.createElement('i');
  probe.style.color = value;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return [name, color];
})), Object.entries(colors));
// The ticket's rule: only Ultra's navy canvas is dark.
const SCHEMES = { club: 'light', exclusive: 'light', private: 'light', ultra: 'dark' };

for (const [theme, scheme] of Object.entries(SCHEMES)) {
  const vars = themeVars(theme);
  // AppRoot always writes data-theme, so the app's own dark scheme is the one the theme must override.
  for (const [os, app] of [['light', 'light'], ['dark', 'light'], ['dark', 'dark']]) {
    test(`${theme} under OS ${os}, app ${app}: canvas, text, action, focus ring, logo and color-scheme follow the theme`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      // The logo fixture shows the light-surface logo, and the dark one under mode=dark.
      const logos = page.getByRole('img', { name: 'Finnomena', exact: true });
      await page.goto(`/?layout=logo${scheme === 'dark' ? '&mode=dark' : ''}`);
      const toned = await logos.first().getAttribute('src');

      await page.emulateMedia({ colorScheme: os });
      await page.goto(`/?layout=immersive&theme=${theme}${app === 'dark' ? '&mode=dark' : ''}`);
      const layout = page.locator('.neon-layout');
      await expect(layout).toHaveAttribute('data-immersive-theme', theme);
      await expect(layout).toHaveCSS('background-color', rgb(vars.canvas));
      await expect(layout).toHaveCSS('color', rgb(vars.text));
      await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('color', rgb(vars.text));
      await page.screenshot({ path: test.info().outputPath(`immersive-${theme}-os-${os}-app-${app}.png`) });

      // Cards and popovers portalled into the body sit on the canvas in its text, so muted text stays readable;
      // a disabled fill is CDS's blend, which every theme's far-apart action and canvas raise to 93.7%.
      expect(await resolve(page, { card: 'var(--card)', cardText: 'var(--card-foreground)', popover: 'var(--popover)', popoverText: 'var(--popover-foreground)', disabled: 'var(--primary-disabled)' }))
        .toEqual(await resolve(page, { card: vars.canvas, cardText: vars.text, popover: vars.canvas, popoverText: vars.text, disabled: `color-mix(in srgb, ${vars.action} 93.7%, ${vars.canvas})` }));

      const action = page.getByRole('button', { name: 'Final action' });
      await expect(action).toHaveCSS('background-color', rgb(vars.action));
      await expect(action).toHaveCSS('color', rgb(vars['on-action']));
      await page.getByRole('button', { name: /^Request 24 / }).focus();
      await page.keyboard.press('Tab');
      await expect(action).toBeFocused();
      // The Button draws its ring in --ring at 50%, transitioning in: the shadow must settle on the theme action at 50%.
      const { ring } = await resolve(page, { ring: `color-mix(in oklab, ${vars.action} 50%, transparent)` });
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

// Text on the fills a themed page paints (white on white on Ultra before the adapter mapped them). Expected colors come from
// immersive.css's mapping: palette 75 under the theme's text, and the action pair for inverse fills.
// Computed colors come as rgb(0-255) or, for a color-mix(), color(srgb 0-1).
const channels = text => { const values = text.match(/[\d.]+/g).slice(0, 3).map(Number); return text.startsWith('color(') ? values : values.map(v => v / 255); };
const luminance = colorText => channels(colorText)
  .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

for (const theme of Object.keys(SCHEMES)) {
  const vars = themeVars(theme);
  test(`${theme}: secondary, outline, ghost, toggle, tag and segmented fills take the theme, text readable`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/?layout=immersive&theme=${theme}&controls`);
    const fill = 'var(--immersive-palette-75)';
    const expected = await resolve(page, { fill, text: 'var(--immersive-text)', action: 'var(--immersive-action)', onAction: 'var(--immersive-on-action)', pressed: `color-mix(in srgb, ${vars.action} 95.7%, ${vars.canvas})` });
    expect(expected.fill).toBe(rgb(vars['palette-75']));
    const colors = locator => locator.evaluate(el => {
      const style = getComputedStyle(el);
      return { background: style.backgroundColor, color: style.color };
    });
    const checks = [
      ['secondary button', page.getByRole('button', { name: 'Secondary action', exact: true }), expected.fill, expected.text],
      ['unpressed toggle', page.getByRole('button', { name: 'Unpressed toggle', exact: true }), expected.fill, expected.text],
      ['pressed toggle', page.getByRole('button', { name: 'Pressed toggle', exact: true }), expected.pressed, expected.onAction],
      ['neutral tag', page.getByText('Neutral tag', { exact: true }), expected.fill, expected.text],
      ['segmented track', page.getByRole('radiogroup', { name: 'Period' }), expected.fill, expected.text],
      ['checked segment', page.getByRole('radio', { name: 'Month', exact: true }), expected.action, expected.onAction],
    ];
    for (const [name, locator, background, color] of checks) {
      expect(await colors(locator), name).toEqual({ background, color });
      expect(ratio(color, background), `${name} text contrast`).toBeGreaterThanOrEqual(4.5);
    }
    // Hover fills are the accent slot; the text stays the theme's.
    for (const name of ['Outline action', 'Ghost action', 'Secondary action']) {
      const button = page.getByRole('button', { name, exact: true });
      await button.hover();
      await expect.poll(() => colors(button), { message: `${name} hover` }).toEqual({ background: expected.fill, color: expected.text });
    }
    await page.screenshot({ path: test.info().outputPath(`immersive-${theme}-controls.png`) });
  });

  test(`${theme}: a sticky section pins to the viewport while the window scrolls`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`/?layout=immersive&theme=${theme}&controls`);
    const probe = page.locator('[data-sticky-probe]');
    // Any non-visible overflow between the section and the window traps sticky, scrolling or not.
    expect(await probe.evaluate(el => {
      const traps = [];
      for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (style.overflowX !== 'visible' || style.overflowY !== 'visible') traps.push(node.className || node.tagName);
      }
      return traps;
    })).toEqual([]);
    const start = await probe.evaluate(el => el.getBoundingClientRect().top);
    expect(start).toBeGreaterThan(0);
    await page.evaluate(() => window.scrollTo(0, 600));
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(600);
    expect(await probe.evaluate(el => el.getBoundingClientRect().top)).toBe(0);
    await page.screenshot({ path: test.info().outputPath(`immersive-${theme}-sticky.png`) });
  });
}

// Without a theme the content keeps InspectorView's own scrolling body.
test('unthemed ImmersiveLayout keeps its scrollable content pane', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/?layout=immersive&controls');
  const pane = page.locator('[data-sticky-probe]').locator('xpath=../..');
  await expect(pane).toHaveCSS('overflow-y', 'auto');
  expect(await pane.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
  expect(await page.evaluate(() => document.scrollingElement.scrollHeight <= innerHeight)).toBe(true);
});

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
