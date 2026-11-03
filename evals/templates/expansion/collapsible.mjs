// collapsible → CDS Collapsible, open: the region adds no padding, fill or
// type of its own, and sits where the page's stack puts it below the trigger.
const at = '[data-measure=collapsible-default]';

export const screens = [{
  targets: {
    content: { cds: `${at} [role=region]`, neon: `${at} [data-slot=collapsible-content]`, check: ['h', 'w', 'pad', 'bg'] },
    contentText: { cds: `${at} [role=region] p`, neon: `${at} [data-slot=collapsible-content] p`, check: ['font', 'color'] },
  },
  gaps: [['trigger', 'content', 'y']],
  extraTargets: {
    trigger: { cds: `${at} button`, neon: `${at} [data-slot=collapsible-trigger]`, check: [] },
  },
}];

// The trigger says whether the content is expanded and names it; Enter and
// Space show and hide it. The trigger is the page's Button, whose focus ring
// the button checks already cover.
export function a11y({ test, expect, gotoExpansion }) {
  test('Enter and Space show and hide the content and expose its expanded state', async ({ page }) => {
    await gotoExpansion(page);
    const details = page.locator(at).getByRole('button', { name: 'รายละเอียด / Details' });
    await expect(details).toHaveAttribute('aria-expanded', 'true');
    const content = page.locator(`[id="${await details.getAttribute('aria-controls')}"]`);
    await expect(content).toHaveText('กองทุนนี้ลงทุนในหุ้นไทยขนาดใหญ่ / This fund invests in large Thai stocks');
    await details.focus();
    await page.keyboard.press('Enter');
    await expect(details).toHaveAttribute('aria-expanded', 'false');
    await expect(content).toBeHidden();
    await page.keyboard.press('Space');
    await expect(details).toHaveAttribute('aria-expanded', 'true');
    await expect(content).toBeVisible();
    await page.keyboard.press('Space');
    await expect(details).toHaveAttribute('aria-expanded', 'false');
    await expect(content).toBeHidden();
  });
}
