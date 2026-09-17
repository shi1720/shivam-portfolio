import { test, expect } from '@playwright/test';

test('sculpture rotates through real project links and pause freezes the tour', async ({ page }) => {
  test.setTimeout(45000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#studio');
  const canvas = page.locator('.intelligence canvas');
  const label = page.locator('.sculpture-project-label');
  await expect(canvas).toBeVisible();
  await expect(label).toContainText('OfferLoop');
  const before = await canvas.screenshot();
  await page.waitForTimeout(1000);
  await expect(label).toContainText('OfferLoop');
  expect((await canvas.screenshot()).equals(before)).toBe(false);
  await expect(label).not.toContainText('OfferLoop', { timeout: 11000 });
  await page.getByRole('button', { name: 'Pause sculpture', exact: true }).click();
  await page.waitForTimeout(700); // Allow the manual control's damping to settle.
  const pausedName = await label.innerText();
  const pausedImage = await canvas.screenshot();
  await page.waitForTimeout(6500);
  expect(await label.innerText()).toBe(pausedName);
  expect((await canvas.screenshot()).equals(pausedImage)).toBe(true);
  await page.getByRole('button', { name: 'Animate sculpture', exact: true }).click();
  await expect(label).not.toHaveText(pausedName, { timeout: 11000 });
  await label.focus();
  const focusedName = await label.locator('span').innerText();
  await page.waitForTimeout(6500);
  await expect(label.locator('span')).toHaveText(focusedName);
  await label.press('Enter');
  await expect(page.getByRole('dialog')).toContainText(focusedName);
});

test('reduced motion holds OfferLoop while preserving manual drag and project access', async ({ page }) => {
  await page.goto('/#studio');
  const canvas = page.locator('.intelligence canvas');
  const label = page.locator('.sculpture-project-label');
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(300);
  const before = await canvas.screenshot();
  await page.waitForTimeout(6500);
  await expect(label).toContainText('OfferLoop');
  expect((await canvas.screenshot()).equals(before)).toBe(true);
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + box.width * .45, box.y + box.height * .45);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * .7, box.y + box.height * .5, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(700);
  expect((await canvas.screenshot()).equals(before)).toBe(false);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  const chosenName = await label.locator('span').innerText();
  await label.click();
  await expect(page.getByRole('dialog')).toContainText(chosenName);
});
