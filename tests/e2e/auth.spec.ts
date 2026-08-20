import { expect, test } from "@playwright/test";
import { users } from "../fixtures/test-data";
import { resetMockApi } from "../helpers/mock-api";
import { LoginPage } from "../pages/login.page";

test.describe("Login system", () => {
  test.beforeEach(async ({ request }) => {
    await resetMockApi(request);
  });

  test("empty email and password", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.visit();
    await loginPage.submitCredentials("", "");

    await expect(loginPage.errorMessage("Email and password are required")).toBeVisible();
  });

  test("invalid email and valid password", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.visit();
    await loginPage.submitCredentials("not-an-email", "Password123!");

    await expect(loginPage.errorMessage("Invalid email format")).toBeVisible();
  });

  test("valid email and invalid password", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.visit();
    await loginPage.submitCredentials(users.candidateMany.email, "BadPassword123!");

    await expect(loginPage.errorMessage("Invalid email or password")).toBeVisible();
  });

  test("invalid email and invalid password", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.visit();
    await loginPage.submitCredentials("bad.email", "bad-password");

    await expect(loginPage.errorMessage("Invalid email format")).toBeVisible();
  });
});
