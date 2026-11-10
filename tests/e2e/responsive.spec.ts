import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test("mobile author dashboard renders without horizontal overflow", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Use author" }).click();
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/author", { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "Publishing overview" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await expect(page.getByRole("button", { name: "Open navigation" })).toBeVisible();
});

test("mobile admin queue uses responsive cards without horizontal overflow", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Use admin" }).click();
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/admin", { timeout: 30_000 });
  await page.goto("/admin/tickets");
  await expect(page.getByRole("heading", { name: "Ticket queue" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await expect(page.getByRole("button", { name: "Open navigation" })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Operations overview" })).toBeVisible();
});
