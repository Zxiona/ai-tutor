import { test, expect } from "@playwright/test";

test("homepage has Login link [REQ-AUTH-01]", async ({ page }) => {
<<<<<<< HEAD
  await page.goto("http://localhost:3000/");
=======
  await page.goto("/");
>>>>>>> main
  await expect(page.getByRole("link", { name: /login|sign in/i })).toBeVisible();
});