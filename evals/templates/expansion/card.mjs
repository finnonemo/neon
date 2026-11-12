// card → CDS ContentCard (Card is deprecated in CDS 9.26), bordered on
// bgElevation1: the 24px radius, 16px padding and hairline, the headline
// title over the label2 muted description, body text, then the footer, 16px
// apart. The description's height shows the Thai line count (both targets
// wrap it at 288px). The card's own height is not compared: its footer holds a
// small button, 38px in CDS (compact) and 36px in Neon (size sm, Core's Small).
const card = '[data-measure=card-default]';

export const screens = [{
  targets: {
    card: { cds: `${card} article`, neon: `${card} [data-slot=card]`, check: ['w', 'pad', 'radius', 'bg', 'border'] },
    title: { cds: `${card} article > div > div > div > div`, neon: `${card} [data-slot=card-title]`, check: ['font', 'color', 'h'] },
    description: { cds: `${card} article > div > div > div > p`, neon: `${card} [data-slot=card-description]`, check: ['font', 'color', 'h'] },
    content: { cds: `${card} article > p`, neon: `${card} [data-slot=card-content]`, check: ['font', 'color', 'h'] },
  },
  extraTargets: {
    header: { cds: `${card} article > div`, neon: `${card} [data-slot=card-header]`, check: [] },
    footer: { cds: `${card} article > footer`, neon: `${card} [data-slot=card-footer]`, check: [] },
  },
  gaps: [
    ['title', 'description', 'y'],
    ['header', 'content', 'y'],
    ['content', 'footer', 'y'],
  ],
}];

// Long Thai text wraps inside the card at a phone and a desktop width.
export function a11y({ test, expect, gotoExpansion }) {
  test('long Thai card text wraps inside the card without overflow', async ({ page }) => {
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await gotoExpansion(page);
      await page.evaluate(() => document.fonts.ready);
      const measured = await page.locator(`${card} [data-slot=card]`).evaluate((box) => {
        const right = box.getBoundingClientRect().right - parseFloat(getComputedStyle(box).paddingRight);
        return ['title', 'description', 'content'].map((part) => {
          const el = box.querySelector(`[data-slot=card-${part}]`);
          return { part, lines: Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)), overflow: el.scrollWidth - el.clientWidth, inside: el.getBoundingClientRect().right <= right + 0.5 };
        });
      });
      expect(measured[1].lines, `description at ${width}px`).toBeGreaterThanOrEqual(2);
      for (const part of measured) {
        expect(part.overflow, `${part.part} at ${width}px`).toBeLessThanOrEqual(0);
        expect(part.inside, `${part.part} at ${width}px`).toBe(true);
      }
    }
  });
}
