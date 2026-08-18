import { expect, test } from "@playwright/test";
import { users } from "../fixtures/test-data";
import { LoginPage } from "../pages/login.page";

test.describe("Authentication pages", () => {
  test("renders login form fields and helper links", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.visit();

    await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(page.getByRole("link", { name: "Create an account" })).toHaveAttribute("href", "/register");
    await expect(page).toHaveTitle(/Login \| Kainos Careers/i);
  });

  test("renders register page with expected fields", async ({ page }) => {
    await page.goto("/register");

    await expect(page.getByRole("heading", { name: "Create Your Account" })).toBeVisible();
    await expect(page.locator("#register-email")).toBeVisible();
    await expect(page.locator("#register-password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();
    await expect(page).toHaveTitle(/Register \| Kainos Careers/i);
  });

  test("shows an error message for invalid login", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.visit();
    await loginPage.submitCredentials(users.invalid.email, users.invalid.password);

    await expect(loginPage.errorMessage).toBeVisible();
  });

  test("navigates from login to register page", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.visit();
    await page.getByRole("link", { name: "Create an account" }).click();

    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByRole("heading", { name: "Create Your Account" })).toBeVisible();
  });
});
