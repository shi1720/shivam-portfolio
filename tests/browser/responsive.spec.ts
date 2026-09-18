import { test, expect } from '@playwright/test';

for (const [width, height] of [[320, 568], [390, 844], [600, 960], [820, 1180], [640, 360], [844, 390]]) {
  test(`every touch room ends just above the dock at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.addInitScript(() => sessionStorage.setItem('shivam-ai-guide-introduced', 'yes'));
    for (const room of ['studio', 'work', 'about', 'lab', 'contact']) {
      await page.goto(`/#${room}`);
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      const geometry = await page.locator('main > section').evaluate(section => {
        const children = [...section.children].filter(child => child.getClientRects().length);
        const contentBottom = Math.max(...children.map(child => child.getBoundingClientRect().bottom));
        const dockTop = document.querySelector('.studio-dock')!.getBoundingClientRect().top;
        return { gap: dockTop - contentBottom, pageWidth: document.documentElement.scrollWidth };
      });
      // The final content must clear navigation without a second, empty screen tail.
      expect(geometry.gap, `${room}: final content hidden under navigation`).toBeGreaterThanOrEqual(12);
      expect(geometry.gap, `${room}: excessive empty space before navigation`).toBeLessThanOrEqual(40);
      expect(geometry.pageWidth, `${room}: horizontal overflow`).toBeLessThanOrEqual(width);
    }
    const socialGeometry = await page.locator('.contact-social').evaluate(row => [...row.children].map(control => {
      const range = document.createRange();
      range.selectNodeContents(control);
      const text = range.getBoundingClientRect();
      const box = control.getBoundingClientRect();
      return { textTop: text.top, textBottom: text.bottom, top: box.top, height: box.height };
    }));
    for (const control of socialGeometry) {
      expect(control.height).toBeGreaterThanOrEqual(44);
      expect(Math.abs(control.top - socialGeometry[0].top)).toBeLessThanOrEqual(1);
      expect(Math.abs(control.textTop - socialGeometry[0].textTop)).toBeLessThanOrEqual(1);
      expect(Math.abs(control.textBottom - socialGeometry[0].textBottom)).toBeLessThanOrEqual(1);
    }
  });
}

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
    await page.getByRole('button', {name: 'Ask AI about Shivam and his projects'}).click();
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

test('short desktop keeps the name and closing copy clear of the dock', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/#studio');
  await page.evaluate(() => document.fonts.ready);
  const footer = await page.locator('.studio-bottom').boundingBox();
  const name = await page.locator('.monument-name').boundingBox();
  const dock = await page.locator('.studio-dock').boundingBox();
  expect(footer!.y).toBeGreaterThanOrEqual(name!.y + name!.height);
  expect(footer!.y + footer!.height).toBeLessThan(dock!.y);
  await expect(page.locator('.studio-bottom')).toBeInViewport({ ratio: 1 });
  await expect(page.locator('.studio-project-links')).toHaveCount(0);
});
