import { test, expect } from '@playwright/test';

for (const [width, height] of [[320, 568], [600, 960], [820, 1180], [640, 360], [844, 390]]) {
  test(`touch layout and chat at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/#studio');
    await page.evaluate(() => document.fonts.ready);
    const intro = await page.locator('.studio-intro').boundingBox();
    const art = await page.locator('.studio-art').boundingBox();
    expect(art!.y).toBeGreaterThanOrEqual(intro!.y + intro!.height - 26);
    await page.goto('/#contact');
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const socials = await page.locator('.contact-social').boundingBox();
    const dock = await page.locator('.studio-dock').boundingBox();
    expect(socials!.y + socials!.height).toBeLessThanOrEqual(dock!.y);
    await page.route('**/api/chat', route => route.fulfill({json: {
      answer: 'Shivam builds applied AI products. Explore his engineering decisions and public project work.', sources: [], mode: 'ai'
    }}));
    await page.getByRole('button', {name: 'Open AI portfolio guide'}).click();
    await page.getByLabel('Your question').fill('Show me the projects');
    await page.getByRole('button', {name: 'Send question'}).click();
    await expect(page.getByRole('log')).toContainText('Shivam builds applied AI products.');
    const geometry = await page.locator('.chat-messages').evaluate(el => {
      const style = getComputedStyle(el);
      return el.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    });
    expect(geometry).toBeGreaterThan(90);
    const send = await page.getByRole('button', {name: 'Send question'}).boundingBox();
    expect(send!.y + send!.height).toBeLessThanOrEqual(height);
    expect(send!.width).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.getByRole('button', {name: 'Close AI guide'}).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
}
