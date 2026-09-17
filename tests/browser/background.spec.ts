import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("background story uses accessible tabs, keyboard navigation and readable chapters", async ({ page }, testInfo) => {
  await page.goto("/#about");
  const tabs = page.getByRole("tablist", { name: "Chapters of Shivam’s background" });
  await tabs.scrollIntoViewIfNeeded();
  const choices = tabs.getByRole("tab");
  await expect(choices).toHaveCount(4);
  await choices.nth(0).focus();
  await page.keyboard.press("ArrowRight");
  await expect(choices.nth(1)).toBeFocused();
  await expect(choices.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText("allocation economy");
  await page.keyboard.press("End");
  await expect(choices.nth(3)).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText("forward-deployed engineering");
  await page.keyboard.press("Home");
  await expect(choices.nth(0)).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(choices.nth(3)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("tabpanel")).toBeFocused();
  for (let i = 0; i < 4; i++) {
    await choices.nth(i).click();
    await expect(page.getByRole("tabpanel")).toHaveCount(1);
    await expect(page.locator(".book-spread[hidden]")).toHaveCount(3);
    await expect(choices.nth(i)).toHaveAttribute("tabindex", "0");
    const animation = await page.locator(".book-spread:not([hidden]) .paper-fold").first().evaluate(el => getComputedStyle(el).animationName);
    expect(animation).toBe("none");
    await page.locator(".background-book").screenshot({ style: ".studio-dock-wrap { visibility: hidden !important; }", path: `test-results/${testInfo.project.name}-book-${i+1}.png` });
  }
  const results = await new AxeBuilder({ page }).include(".background-book").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(results.violations.filter(v => ["serious", "critical"].includes(v.impact || ""))).toEqual([]);
  await page.getByRole("button", { name: "Meet the work", exact: true }).click();
  await expect(page.getByRole("heading", { name: "A few places I’ve put it into practice." })).toBeInViewport();
  expect(await page.title()).not.toMatch(/[\u2013\u2014]/);
  expect(await page.locator("body").innerText()).not.toMatch(/[\u2013\u2014]/);
});

test("storybook fits touch widths and every chapter stays readable above the dock", async ({ page }) => {
  for (const [width, height] of [[320, 568], [390, 844], [600, 960], [820, 1180], [640, 360]]) {
    await page.setViewportSize({ width, height });
    await page.goto("/#about");
    const tabs = page.getByRole("tablist", { name: "Chapters of Shivam’s background" });
    for (let i = 0; i < 4; i++) {
      await tabs.getByRole("tab").nth(i).click();
      const panel = page.getByRole("tabpanel");
      await expect(panel.locator(".book-copy")).toBeVisible();
      const tabBox = await tabs.getByRole("tab").nth(i).boundingBox();
      expect(tabBox!.height, `${width}: tab ${i}`).toBeGreaterThanOrEqual(44);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${width}: chapter ${i}`).toBeLessThanOrEqual(width);
    }
    const lastParagraph = page.getByRole("tabpanel").locator(".book-note");
    await lastParagraph.scrollIntoViewIfNeeded();
    const copy = await lastParagraph.boundingBox();
    const dock = await page.locator(".studio-dock").boundingBox();
    expect(copy!.y + copy!.height, `${width}: full chapter visible`).toBeLessThanOrEqual(dock!.y);
    const previous = page.getByRole("button", { name: "Previous chapter" });
    await previous.click();
    await expect(page.getByRole("tabpanel")).toContainText("product management becoming more important");
    await page.getByRole("button", { name: "Turn the page" }).click();
    await expect(page.getByRole("tabpanel")).toContainText("forward-deployed engineering");
  }
});

test("About remains readable at 200 percent text size", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#about");
  await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".background-book p, .background-book h2, .background-book h3, .background-book button"));
    const originalSizes = elements.map(element => parseFloat(getComputedStyle(element).fontSize));
    elements.forEach((element, index) => element.style.setProperty("font-size", `${originalSizes[index] * 2}px`, "important"));
  });
  await page.getByRole("tab", { name: "03 Judgment & AI" }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Human-centered design helps me understand people");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});


test("normal motion unfolds the paper while chapter text is available immediately", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#about");
  await page.getByRole("tab", { name: "02 Teams & ownership" }).click();
  const panel = page.getByRole("tabpanel");
  await expect(panel).toContainText("allocation economy");
  const fold = panel.locator(".paper-fold").first();
  expect(await fold.evaluate(el => getComputedStyle(el).animationName)).toBe("paper-rise");
  await fold.evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished)));
  await expect(panel.locator(".book-copy")).toBeVisible();
});
