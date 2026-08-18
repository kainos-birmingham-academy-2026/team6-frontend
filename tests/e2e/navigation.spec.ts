import { expect, test } from "@playwright/test";
import { users } from "../fixtures/test-data";
import { loginThroughUi } from "../helpers/auth";
import { resetMockApi } from "../helpers/mock-api";

test.describe("Navigating pages", () => {
  test.beforeEach(async ({ request }) => {
    await resetMockApi(request);
  });

  test("buttons between pages work correctly", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Login" }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.getByRole("link", { name: "Create an account" }).click();
    await expect(page).toHaveURL(/\/register/);

    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/login/);

    await loginThroughUi(page, users.candidateMany);
    await expect(page).toHaveURL(/\/job-roles/);

    await page.locator("a.role-name-link, .featured-role h2 a").first().click();
    await expect(page).toHaveURL(/\/job-roles\/\d+$/);

    await page.getByRole("link", { name: "Back to Job Roles" }).click();
    await expect(page).toHaveURL(/\/job-roles/);
  });
});
