import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const triggerName = "Ask AI about Shivam and his projects";
const invitation = (page: import("@playwright/test").Page) => page.getByRole("complementary", { name: "Meet the AI guide" });

test("invitation waits, leaves focus alone, expires and only appears once per visit", async ({ page }) => {
  await page.clock.install();
  await page.goto("/#contact");
  await expect(page.getByRole("button", { name: triggerName })).toContainText("Ask AI");
  await page.getByRole("link", { name: "02 The human", exact: true }).focus();
  await page.clock.fastForward(6000);
  await expect(invitation(page)).not.toBeVisible();
  await page.clock.fastForward(600);
  await expect(invitation(page)).toBeVisible();
  await expect(page.getByRole("link", { name: "02 The human", exact: true })).toBeFocused();
  await page.clock.fastForward(12500);
  await expect(invitation(page)).not.toBeVisible();
  await page.reload();
  await page.clock.fastForward(20000);
  await expect(invitation(page)).not.toBeVisible();
});

for (const prompt of ["What has Shivam built?", "Would he fit our team?"]) {
  test(`preview question starts one conversation: ${prompt}`, async ({ page }) => {
    const requests: { messages: { role: string; content: string }[] }[] = [];
    await page.route("**/api/chat", async route => {
      requests.push(route.request().postDataJSON());
      await route.fulfill({ json: { answer: "Explore Shivam’s work and experience.", sources: [], mode: "ai" } });
    });
    await page.clock.install();
    await page.goto("/#contact");
    await page.clock.fastForward(6600);
    await invitation(page).getByRole("button", { name: prompt, exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("log")).toContainText("Explore Shivam’s work and experience.");
    expect(requests).toHaveLength(1);
    expect(requests[0].messages).toEqual([{ role: "user", content: prompt }]);
    await expect(invitation(page)).not.toBeVisible();
    if (prompt === "What has Shivam built?") await page.keyboard.press("Escape");
    else await page.getByRole("button", { name: "Close AI guide" }).click();
    await expect(page.getByRole("button", { name: triggerName })).toBeFocused();
    await page.clock.fastForward(20000);
    await expect(invitation(page)).not.toBeVisible();
  });
}

test("keyboard readers can take their time and dismiss without opening chat", async ({ page }) => {
  await page.clock.install();
  await page.goto("/#contact");
  await page.clock.fastForward(6600);
  const prompt = invitation(page).getByRole("button", { name: "What has Shivam built?", exact: true });
  await prompt.focus();
  await page.clock.fastForward(20000);
  await expect(prompt).toBeVisible();
  await expect(prompt).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(invitation(page)).not.toBeVisible();
  await expect(page.getByRole("button", { name: triggerName })).toBeFocused();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("opening the guide immediately suppresses the invitation", async ({ page }) => {
  await page.clock.install();
  await page.goto("/#contact");
  await page.getByRole("button", { name: triggerName }).click();
  await page.clock.fastForward(10000);
  await expect(invitation(page)).not.toBeVisible();
  await page.getByRole("button", { name: "Close AI guide" }).click();
  await page.clock.fastForward(20000);
  await expect(invitation(page)).not.toBeVisible();
});

test("the invitation waits until a shared project is closed", async ({ page }) => {
  await page.clock.install();
  await page.goto("/#project=OfferLoop-Job-CRM");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.clock.fastForward(10000);
  await expect(invitation(page)).not.toBeVisible();
  await page.getByRole("button", { name: "Close project" }).click();
  await page.clock.fastForward(6600);
  await expect(invitation(page)).toBeVisible();
  await page.getByRole("button", { name: "Dismiss AI invitation" }).click();
  await expect(invitation(page)).not.toBeVisible();
});

test("enlarged text in landscape keeps dismissal and both questions reachable", async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.clock.install();
  await page.goto("/#contact");
  await page.clock.fastForward(6600);
  await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("body *"));
    const sizes = elements.map(el => parseFloat(getComputedStyle(el).fontSize));
    elements.forEach((el, index) => el.style.fontSize = `${sizes[index] * 2}px`);
  });
  const card = (await invitation(page).boundingBox())!;
  expect(card.y).toBeGreaterThanOrEqual(0);
  expect(card.y + card.height).toBeLessThan(390);
  const close = page.getByRole("button", { name: "Dismiss AI invitation" });
  await expect(close).toBeInViewport({ ratio: 1 });
  await invitation(page).getByRole("button", { name: "Would he fit our team?", exact: true }).focus();
  await expect(invitation(page).getByRole("button", { name: "Would he fit our team?", exact: true })).toBeInViewport({ ratio: 1 });
  await expect(close).toBeInViewport({ ratio: 1 });
  await close.click();
  await expect(invitation(page)).not.toBeVisible();
});

for (const [width, height] of [[320, 568], [390, 844], [844, 390], [1440, 1000]]) {
  test(`quiet invitation fits at ${width}x${height} with reduced motion`, async ({ page }, info) => {
    await page.setViewportSize({ width, height });
    await page.clock.install();
    await page.goto("/#contact");
    await page.clock.fastForward(6600);
    await expect(invitation(page)).toBeVisible();
    const card = (await invitation(page).boundingBox())!;
    const dock = (await page.locator(".studio-dock").boundingBox())!;
    expect(card.x).toBeGreaterThanOrEqual(0);
    expect(card.y).toBeGreaterThanOrEqual(0);
    expect(card.x + card.width).toBeLessThanOrEqual(width);
    expect(card.y + card.height).toBeLessThan(dock.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const button = page.getByRole("button", { name: triggerName });
    expect(await button.evaluate(el => getComputedStyle(el).animationName)).toBe("none");
    const axe = await new AxeBuilder({ page }).include(".studio-dock").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(axe.violations.filter(v => ["serious", "critical"].includes(v.impact || ""))).toEqual([]);
    await page.screenshot({ path: `test-results/ai-invitation-${info.project.name}-${width}.png` });
  });
}
