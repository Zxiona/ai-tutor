import { test, expect } from "@playwright/test";

test("homepage has Login link [REQ-AUTH-01]", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /login|sign in/i })).toBeVisible();
});