import { test, expect } from '@playwright/test';
import { focusColor, keyboardFocus } from './expansion.mjs';

// Fixtures exercise the actual installed Neon base components, not copies of their logic.
test.beforeEach(async ({ page }) => {
  page.on('pageerror', error => { throw error; });
  page.on('console', message => { if (message.type() === 'error') throw new Error(message.text()); });
});

// The functional shell clips at the viewport (.neon-layout is overflow: hidden), so a pane whose
// content is wider than the pane never widens the document: only the pane's own scroll container
// shows it. Pane scrollers are the ones the layouts give an inline overflowY (ContentView,
// InspectorView, the sidebar); the board's sideways scroller sets overflowX and is meant to scroll.
const widePanes = page => page.locator('.neon-layout').evaluate(root => [...root.querySelectorAll('*')]
  .filter(el => ['auto', 'scroll'].includes(el.style.overflowY) && el.clientWidth > 0)
  .filter(el => el.scrollWidth > el.clientWidth)
  .map(el => `${el.closest('[aria-label]')?.getAttribute('aria-label') ?? el.parentElement?.className}: ${el.scrollWidth} > ${el.clientWidth}`));

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

test('a grid wider than its pane is caught in the pane, not the document', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?layout=app');
  await page.getByRole('region', { name: 'Content', exact: true }).evaluate(pane => {
    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(6, max-content)';
    grid.innerHTML = '<span>a long label that sets the track width</span>'.repeat(6);
    pane.querySelector('[style*="overflow-y"]').append(grid);
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1440);
  expect(await widePanes(page)).toHaveLength(1);
});

// The example library's pane-grids screen (docs/design/examples/pane-grids.md). AppShell's
// content pane keeps a fixed 360-400px at desktop and ContentLayout's fills the rest, so the
// same viewport gives a narrow and a wide pane: a grid that followed the viewport would fail one.
for (const layout of ['app', 'content']) {
  test(`${layout}: pane-grids example follows the pane's width at every breakpoint`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto(`/?layout=${layout}&example=pane-grids`);
    for (const width of [320, 375, 500, 768, 987, 988, 1080, 1272, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await widePanes(page), `${width}px`).toEqual([]);
      const form = await page.locator('[data-example="form"]').evaluate(grid => {
        const box = grid.parentElement.parentElement;
        const inner = box.clientWidth - parseFloat(getComputedStyle(box).paddingLeft) - parseFloat(getComputedStyle(box).paddingRight);
        return { inner, columns: new Set([...grid.children].map(field => Math.round(field.getBoundingClientRect().x))).size };
      });
      expect(form.columns, `${width}px, pane content ${form.inner}px`).toBe(form.inner >= 480 ? 2 : 1);
      const tiles = await page.locator('[data-example="tiles"]').evaluate(list => ({ width: list.clientWidth, tiles: [...list.children].map(tile => tile.getBoundingClientRect().width) }));
      for (const tile of tiles.tiles) expect(tile, `${width}px tile`).toBeGreaterThanOrEqual(Math.min(224, tiles.width) - 1);
      if ([375, 1440].includes(width)) await page.screenshot({ path: test.info().outputPath(`pane-grids-${layout}-${width}.png`) });
    }
  });
}

// Figma's min and max frame for each desktop tier; sidebar widths come from registry/theme/breakpoints.config.ts.
const desktopTiers = [[988, 64, 360], [1079, 64, 360], [1080, 240, 360], [1271, 240, 360], [1272, 320, 360], [1439, 320, 360], [1440, 360, 400], [1920, 360, 560], [2560, 360, 560]];
for (const [layout, fixed, fill] of [['app', 'Content', 'Details'], ['content', 'Details', 'Content']]) {
  test(`${layout}: desktop pane widths retain the fixed panes with workspace navigation`, async ({ page }) => {
    await page.setViewportSize({ width: 988, height: 900 });
    await page.goto(`/?layout=${layout}`);
    for (const [width, sidebar, pane] of desktopTiers) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.getByRole('region', { name: fixed, exact: true })).toHaveJSProperty('offsetWidth', pane);
      await expect(page.getByRole('region', { name: fill, exact: true })).toHaveJSProperty('offsetWidth', width - (width < 1280 ? 64 : 240) - pane);
    }
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
      expect(await widePanes(page)).toEqual([]);
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
      // A lucide icon is an svg drawn in currentColor.
      const icon = nav.querySelector('a span, a svg');
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
    expect(await page.evaluate(() => [...document.fonts].some(f => f.family.includes('IBM Plex Sans Thai') && f.status === 'loaded'))).toBe(true);
    await page.screenshot({ path: test.info().outputPath(`nav-${mode}.png`) });
  });
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

test('Logo follows the color scheme unless a tone pins it', async ({ page }) => {
  const logos = page.getByRole('img', { name: 'Finnomena', exact: true });
  await page.goto('/?layout=logo');
  const light = await logos.first().getAttribute('src');
  await page.goto('/?layout=logo&mode=dark');
  await expect(logos.first()).not.toHaveAttribute('src', light);
  await expect(logos.nth(1)).toHaveAttribute('src', light);
});

// Figma confirms the 1440px cap at 1920px only; 2560 checks that the layout keeps it, not a Figma frame.
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

for (const layout of ['app', 'content']) {
  test(`${layout}: workspace rail, sidebar and persistent header follow reference geometry`, async ({ page }) => {
    await page.goto(`/?layout=${layout}`);
    for (const width of [320, 375, 500, 768, 988, 1279, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      const sidebar = page.locator('.neon-workspace-sidebar');
      if (width < 500) await expect(sidebar).toHaveCount(0);
      else {
        await expect(sidebar).toHaveCSS('width', width < 1280 ? '64px' : '240px');
        await expect(sidebar.getByRole('link', { name: 'รายการ / Requests' })).toBeVisible();
        const label = sidebar.locator('.neon-sidebar-label').first();
        if (width < 1280) await expect(label).toBeHidden();
        else await expect(label).toBeVisible();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const header = page.getByText('พื้นที่ทำงาน / Workspace', { exact: true });
      await expect(header).toBeVisible();
      const before = await header.boundingBox();
      await page.getByRole('button', { name: 'Final action', exact: true }).scrollIntoViewIfNeeded();
      expect((await header.boundingBox()).y).toBe(before.y);
      await page.getByRole('button', { name: 'Search workspace', exact: true }).click();
      await expect(page.getByLabel('Filter', { exact: true })).toBeFocused();
      if (width < 500) await expect(page.locator('.neon-bottom-nav')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
      if ([320, 375, 768, 1440].includes(width)) await page.screenshot({ path: test.info().outputPath(`${layout}-workspace-${width}.png`) });
    }
    await page.screenshot({ path: test.info().outputPath(`${layout}-workspace-wide.png`) });
  });
}
// Core's focus ring: 2px Focus/focus outside the link with a 2px gap, not the base's 1px outline at half strength.
for (const mode of ['light', 'dark']) {
  for (const [layout, width, links] of [
    ['immersive', 375, ['Finnomena']],
    ['app', 768, ['Finnomena', 'รายการ / Requests']],
    ['app', 1440, ['Finnomena', 'รายการ / Requests']],
    ['simple', 768, ['Finnomena', 'รายการ / Requests']],
    ['simple', 1440, ['Finnomena', 'รายการ / Requests']],
  ]) {
    test(`${layout} ${width}px ${mode}: shell links draw Core's focus ring`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/?layout=${layout}&mode=${mode}`);
      for (const name of links) {
        const link = page.locator('.neon-sidebar, header').getByRole('link', { name, exact: true });
        const focus = await keyboardFocus(page, link);
        expect(focus.focusVisible).toBe(true);
        expect(focus.after, name).toBe(`outline 2px ${await focusColor(page)} 2px`);
      }
    });
  }
}

for (const layout of ['app', 'content']) {
  test(`${layout}: desktop panes read sidebar, content, then inspector`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/?layout=${layout}`);
    const left = name => page.getByRole('region', { name, exact: true }).evaluate(el => el.getBoundingClientRect().x);
    const sidebar = await page.locator('.neon-sidebar').evaluate(el => el.getBoundingClientRect().x);
    const content = await left('Content');
    expect(sidebar).toBeLessThan(content);
    expect(content).toBeLessThan(await left('Details'));
  });
}

for (const mode of ['light', 'dark']) {
  for (const layout of ['app', 'content', 'simple', 'board', 'immersive']) {
    test(`${layout} ${mode}: dividers mark visible functional pane boundaries`, async ({ page }) => {
      for (const width of [375, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/?layout=${layout}&mode=${mode}`);
        const sidebar = page.locator('.neon-sidebar');
        if (width === 375 || layout === 'immersive') await expect(sidebar).toHaveCount(0);
        else await expect(sidebar).toHaveCSS('border-inline-end-width', '1px');
        for (const header of await page.locator('[data-pane-control]:visible').all()) {
          await expect(header).toHaveCSS('border-bottom-width', layout === 'immersive' ? '0px' : '1px');
        }
        if (layout === 'app' || layout === 'content') {
          const panes = await page.locator('.neon-layout > section:visible').evaluateAll(nodes => nodes
            .sort((a, b) => a.getBoundingClientRect().x - b.getBoundingClientRect().x)
            .map(el => getComputedStyle(el).borderInlineEndWidth));
          expect(panes).toEqual(width === 375 ? ['0px'] : ['1px', '0px']);
        }
        if (layout === 'board') {
          const borders = await page.locator('.neon-layout > div').filter({ has: page.locator('[data-pane-control]') }).last()
            .evaluate(el => [...el.children].map(column => ({ width: column.getBoundingClientRect().width, border: getComputedStyle(column).borderInlineEndWidth })));
          expect(borders.length).toBeGreaterThan(1);
          borders.forEach((column, i) => {
            expect(column.width).toBe(400);
            expect(column.border).toBe(i === borders.length - 1 ? '0px' : '1px');
          });
        }
      }
    });
  }
}
