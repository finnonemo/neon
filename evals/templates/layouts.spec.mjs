import { test, expect } from '@playwright/test';

// Fixtures exercise actual assembled starter components, not copies of their logic.
test.beforeEach(async ({ page }) => {
  page.on('pageerror', error => { throw error; });
  page.on('console', message => { if (message.type() === 'error') throw new Error(message.text()); });
});

for (const layout of ['app', 'content']) {
  test(`${layout}: selection, back, local state, scroll and focus survive mobile navigation`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`/?layout=${layout}`);
    const content = page.getByRole('region', { name: 'Content', exact: true });
    const details = page.getByRole('region', { name: 'Details', exact: true });
    await expect(content).toBeVisible();
    await expect(details).toBeHidden();
    await page.getByLabel('Filter', { exact: true }).fill('pending');
    const opener = page.getByRole('button', { name: 'Request 18 — ดูรายละเอียดคำขอ', exact: true });
    await opener.scrollIntoViewIfNeeded();
    await opener.focus();
    const scroll = await opener.evaluate(el => {
      let node = el.parentElement;
      while (node && getComputedStyle(node).overflowY !== 'auto') node = node.parentElement;
      return node.scrollTop;
    });
    await page.keyboard.press('Enter');
    await expect(details).toBeFocused();
    await expect(content).toBeHidden();
    await expect(page.getByText('Selected request 18', { exact: true })).toBeVisible();
    await page.getByLabel('Notes', { exact: true }).fill('บันทึกไว้ / retained');
    await page.getByRole('button', { name: 'กลับไปที่รายการ' }).click();
    await expect(opener).toBeFocused();
    await expect(page.getByLabel('Filter', { exact: true })).toHaveValue('pending');
    expect(await opener.evaluate(el => {
      let node = el.parentElement;
      while (node && getComputedStyle(node).overflowY !== 'auto') node = node.parentElement;
      return node.scrollTop;
    })).toBe(scroll);
    // Hidden details and its inputs cannot participate in sequential focus.
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Request 19 — ดูรายละเอียดคำขอ', exact: true })).toBeFocused();
    await opener.click();
    await expect(page.getByLabel('Notes', { exact: true })).toHaveValue('บันทึกไว้ / retained');
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(content).toBeVisible();
    await expect(details).toBeVisible();
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(details).toBeVisible();
    await expect(content).toBeHidden();
    await page.screenshot({ path: test.info().outputPath('mobile-details.png') });
  });

  test(`${layout}: uncontrolled navigation and breakpoint boundaries`, async ({ page }) => {
    await page.setViewportSize({ width: 499, height: 812 });
    await page.goto(`/?layout=${layout}&uncontrolled`);
    const content = page.getByRole('region', { name: 'Content', exact: true });
    const details = page.getByRole('region', { name: 'Details', exact: true });
    await page.getByRole('button', { name: 'ดูรายละเอียด', exact: true }).click();
    await expect(details).toBeFocused();
    await page.getByRole('button', { name: 'กลับไปที่รายการ' }).click();
    await expect(page.getByRole('button', { name: 'ดูรายละเอียด', exact: true })).toBeFocused();
    for (const width of [500, 987, 988, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(content).toBeVisible();
      if (width < 988) await expect(details).toBeHidden();
      else await expect(details).toBeVisible();
    }
    await page.getByLabel('Notes', { exact: true }).focus();
    await page.setViewportSize({ width: 987, height: 900 });
    await expect(content).toBeVisible();
    await expect(details).toBeHidden();
    // The original mobile opener was unmounted on desktop. Return to the
    // content region rather than a stale element or an unrelated new button.
    await expect(content).toBeFocused();
  });
}

for (const layout of ['app', 'content', 'simple', 'board', 'immersive']) {
  for (const width of [375, 499, 500, 987, 988, 1440]) {
    test(`${layout} ${width}px: final action stays reachable with navigation`, async ({ page }) => {
      await page.setViewportSize({ width, height: 812 });
      await page.goto(`/?layout=${layout}`);
      // A nonzero inset is injected through the same variable used for the
      // env(safe-area-inset-bottom) fallback, without relying on desktop emulation.
      await page.locator('.neon-layout').evaluate(el => el.style.setProperty('--neon-safe-area-bottom', '24px'));
      const bottomNav = page.getByRole('navigation', { name: 'Primary navigation' });
      const final = page.getByRole('button', { name: 'Final action', exact: true });
      await final.scrollIntoViewIfNeeded();
      if (width < 500) {
        await expect(bottomNav).toBeVisible();
        const actionBox = await final.boundingBox();
        const navBox = await bottomNav.boundingBox();
        expect(navBox.height).toBe(80);
        expect(actionBox.y + actionBox.height).toBeLessThanOrEqual(navBox.y + 1);
      } else await expect(bottomNav).toHaveCount(0);
      await final.click();
      await expect(page.getByRole('status')).toHaveText('Completed');
      if (layout !== 'board') {
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      }
      if (width === 375 || width === 1440) await page.screenshot({ path: test.info().outputPath(`${layout}-${width}.png`) });
    });
  }
  test(`${layout}: empty navigation reserves no space`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`/?layout=${layout}&empty`);
    await expect(page.locator('.neon-bottom-nav')).toHaveCount(0);
    await expect(page.locator('.neon-layout')).toHaveCSS('padding-bottom', '0px');
    await expect(page.locator('.neon-layout')).toHaveCSS('height', '812px');
  });
}

for (const mode of ['light', 'dark']) {
  test(`${mode}: mobile icon contrast and loaded fonts`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`/?layout=simple&mode=${mode}`);
    await page.evaluate(() => document.fonts.ready);
    const contrast = await page.locator('.neon-bottom-nav').evaluate(nav => {
      const icon = nav.querySelector('a span');
      const parse = color => color.match(/[\d.]+/g).map(Number);
      const bg = parse(getComputedStyle(nav).backgroundColor);
      const fg = parse(getComputedStyle(icon).color);
      const alpha = fg[3] ?? 1;
      const composite = fg.slice(0, 3).map((c, i) => c * alpha + bg[i] * (1 - alpha));
      const lum = c => c.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
        .reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
      return (Math.max(lum(composite), lum(bg)) + .05) / (Math.min(lum(composite), lum(bg)) + .05);
    });
    expect(contrast).toBeGreaterThanOrEqual(3);
    expect(await page.evaluate(() => [...document.fonts].some(f => f.family.includes('CoinbaseIcons') && f.status === 'loaded'))).toBe(true);
    expect(await page.evaluate(() => [...document.fonts].some(f => f.family.includes('IBM Plex Sans Thai') && f.status === 'loaded'))).toBe(true);
    await page.screenshot({ path: test.info().outputPath(`nav-${mode}.png`) });
  });
}

test('integration reference supplies styles, icons, theme switching and logo override', async ({ page }) => {
  await page.goto('/?layout=integration');
  await page.getByRole('button', { name: 'CDS action', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Completed');
  const logos = page.getByRole('img', { name: 'Finnomena', exact: true });
  const light = await logos.first().getAttribute('src');
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(logos.first()).not.toHaveAttribute('src', light);
  await expect(logos.nth(1)).toHaveAttribute('src', light);
  await expect(page.locator('body')).toHaveCSS('margin', '0px');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => [...document.fonts].some(f => f.family.includes('CoinbaseIcons') && f.status === 'loaded'))).toBe(true);
  await page.screenshot({ path: test.info().outputPath('integration-dark.png') });
});

// Filled colored buttons take Text.text-on-color (white) in both modes; inverse keeps text-inverse for its white dark background.
const white = 'rgb(255, 255, 255)';
const buttonLabels = {
  light: { primary: white, positive: white, negative: white, inverse: white, secondary: 'rgba(0, 0, 0, 0.85)',
    transparent: 'rgb(1, 23, 43)', 'local color': 'rgba(0, 0, 0, 0.65)', 'icon primary': white },
  dark: { primary: white, positive: white, negative: white, inverse: 'rgba(0, 0, 0, 0.85)', secondary: white,
    transparent: 'rgb(65, 81, 96)', 'local color': 'rgba(255, 255, 255, 0.65)', 'icon primary': white },
};
for (const root of ['starter', 'integration']) {
  for (const mode of ['light', 'dark']) {
    test(`${root} ${mode}: button labels follow text-on-color`, async ({ page }) => {
      await page.goto(`/?layout=buttons&root=${root}&mode=${mode}`);
      for (const [name, color] of Object.entries(buttonLabels[mode])) {
        await expect(page.getByRole('button', { name, exact: true })).toHaveCSS('color', color);
      }
      await page.screenshot({ path: test.info().outputPath(`buttons-${root}-${mode}.png`) });
    });
  }
}

for (const layout of ['app', 'content', 'simple', 'board', 'immersive']) {
  for (const width of [375, 1440]) {
    test(`${layout} ${width}px: dark surface and logo`, async ({ page }) => {
      await page.setViewportSize({ width, height: 812 });
      const logo = page.getByRole('img', { name: 'Finnomena', exact: true });
      const logoVisible = width === 1440 || layout === 'immersive';
      // Vite may inline small SVGs as data URIs, so compare against the light-mode asset rather than a filename.
      let light;
      if (logoVisible) {
        await page.goto(`/?layout=${layout}`);
        light = await logo.getAttribute('src');
      }
      await page.goto(`/?layout=${layout}&mode=dark`);
      await expect(page.locator('.neon-layout')).toHaveCSS('background-color', 'rgb(0, 0, 0)');
      if (logoVisible) {
        await expect(logo).toBeVisible();
        await expect(logo).not.toHaveAttribute('src', light);
      }
      await page.screenshot({ path: test.info().outputPath(`${layout}-${width}-dark.png`) });
    });
  }
}

// Figma confirms the 1440px cap at 1920px only; 2560 checks that the starter keeps it, not a Figma frame.
for (const width of [1919, 1920, 2560]) {
  test(`immersive ${width}px: content is full-bleed below max and capped at max`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/?layout=immersive');
    const box = await page.locator('.neon-immersive-content').boundingBox();
    const expected = width >= 1920 ? 1440 : width;
    expect(box.width).toBe(expected);
    expect(box.x).toBe((width - expected) / 2);
    await page.screenshot({ path: test.info().outputPath(`immersive-${width}.png`) });
  });
}
