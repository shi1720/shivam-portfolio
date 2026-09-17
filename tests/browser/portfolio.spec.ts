import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("studio navigation, deep links, back and readable layout", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Shivam Gupta", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "01 The work", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Proof of curiosity." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "01 Benchback", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Try the project" }),
  ).toHaveAttribute("href", "https://benchback-ai.web.app");
  await page.getByRole("button", { name: "Close project" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("link", { name: "02 The human", exact: true }).click();
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Proof of curiosity." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("project search and category filter have honest empty states", async ({
  page,
}) => {
  await page.goto("/#work");
  await page
    .getByRole("textbox", { name: "Search projects" })
    .fill("toolstorm");
  await expect(page.locator(".work-list>button")).toHaveCount(1);
  await expect(page.locator(".work-list")).toContainText("Toolstorm");
  await page
    .getByRole("combobox", { name: "Project category" })
    .selectOption("human");
  await expect(page.getByText("No projects found.")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator(".work-list>button")).toHaveCount(29);
});
test("deep-linked case study preserves scope and keyboard escape", async ({
  page,
}) => {
  await page.goto("/#project=AI-Infra-Summit-Hackathon");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByText(/Simulation MVP, not a physical robot deployment/),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
test("lab reveals duplicate effects then verified recovery and exports code", async ({
  page,
}) => {
  await page.goto("/#lab");
  await page
    .getByRole("button", { name: "Run experiment", exact: true })
    .click();
  await expect(page.locator(".lab-result")).toContainText("Needs review");
  await expect(page.locator(".lab-result>div").nth(1)).toContainText("2");
  await page.getByLabel("02 Choose its response").selectOption("verified");
  await page
    .getByRole("button", { name: "Run experiment", exact: true })
    .click();
  await expect(page.locator(".lab-result")).toContainText("Verified");
  await expect(page.locator(".lab-result>div").nth(1)).toContainText("1");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Take the experiment with you .py" })
    .click();
  expect((await download).suggestedFilename()).toBe(
    "shivam-agent-experiment.py",
  );
});
test("AI conversation cites sources, handles errors and retries without duplicate history", async ({
  page,
}) => {
  let requests: any[] = [];
  await page.route("**/api/chat", async (route) => {
    const data = route.request().postDataJSON();
    requests.push(data);
    if (requests.length === 1)
      return route.fulfill({
        status: 503,
        json: { error: "Temporarily unavailable" },
      });
    return route.fulfill({
      json: {
        answer: "Shivam built RepoGym for verifiable coding tasks.",
        sources: [
          {
            id: "repogym",
            title: "RepoGym",
            url: "https://github.com/shi1720/repogym",
          },
        ],
        mode: "ai",
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Open AI portfolio guide" }).click();
  await page.getByLabel("Your question").fill("Tell me about RepoGym");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Temporarily unavailable",
  );
  await expect(page.getByLabel("Your question")).toHaveValue(
    "Tell me about RepoGym",
  );
  await page.getByRole("button", { name: "Retry question" }).click();
  await expect(page.getByRole("log")).toContainText("Shivam built RepoGym");
  expect(requests[1].messages).toEqual([
    { role: "user", content: "Tell me about RepoGym" },
  ]);
  await expect(
    page.getByRole("link", { name: "RepoGym", exact: true }),
  ).toHaveAttribute("href", "https://github.com/shi1720/repogym");
  await page.getByRole("button", { name: "Clear conversation" }).click();
  await expect(page.getByText("Good questions.")).toBeVisible();
});
test("IME confirmation does not send unfinished text", async ({ page }) => {
  let sent = 0;
  await page.route("**/api/chat", (route) => {
    sent++;
    return route.fulfill({
      json: { answer: "Project answer", sources: [], mode: "ai" },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Open AI portfolio guide" }).click();
  const field = page.getByLabel("Your question");
  await field.fill("プロジェクト");
  await field.dispatchEvent("keydown", {
    key: "Enter",
    code: "Enter",
    isComposing: true,
  });
  expect(sent).toBe(0);
  await expect(field).toHaveValue("プロジェクト");
  await field.press("Enter");
  await expect(page.getByRole("log")).toContainText("Project answer");
  expect(sent).toBe(1);
});
test("each room has no horizontal overflow or serious accessibility violations", async ({
  page,
}, testInfo) => {
  const problems: any[] = [];
  for (const room of ["studio", "work", "about", "lab", "contact"]) {
    await page.goto("/#" + room);
    await expect(page.locator("main")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const dimensions = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      width: innerWidth,
    }));
    expect(dimensions.scroll, room).toBeLessThanOrEqual(dimensions.width + 1);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    const serious = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact || ""),
    );
    if (serious.length)
      problems.push({
        room,
        issues: serious.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      });
    await page.screenshot({
      path: `test-results/${testInfo.project.name}-${room}.png`,
      fullPage: false,
    });
  }
  expect(problems).toEqual([]);
});
test("contact points to the requested public email and exact profile", async ({
  page,
}) => {
  await page.goto("/#contact");
  await expect(
    page.getByRole("link", { name: "shivam1720406@gmail.com" }),
  ).toHaveAttribute("href", "mailto:shivam1720406@gmail.com");
  await expect(page.getByRole("link", { name: "LinkedIn ↗" })).toHaveAttribute(
    "href",
    "https://www.linkedin.com/in/shivamgupta-ai/",
  );
  const bg = await page
    .locator(".studio-shell")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).toBe("rgb(250, 77, 32)");
});

test("malformed project URLs recover to the work index", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#project=%E0%A4%A");
  await expect(
    page.getByRole("heading", { name: "Proof of curiosity." }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(errors).toEqual([]);
});
