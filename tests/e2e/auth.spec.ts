import { expect, test } from "@playwright/test";
import { users } from "../fixtures/test-data";
import { loginThroughUi } from "../helpers/auth";
import { resetMockApi } from "../helpers/mock-api";

test.describe("Login system", () => {
  test.beforeEach(async ({ request }) => {
    await resetMockApi(request);
  });

  test("empty email and password", async ({ page }) => {
    await loginThroughUi(page, { email: "", password: "" });

    await expect(page.locator(".auth-message.auth-message-error")).toContainText(
      "Email and password are required"
    );
  });

  test("invalid email and valid password", async ({ page }) => {
    await loginThroughUi(page, { email: "not-an-email", password: "Password123!" });

    await expect(page.locator(".auth-message.auth-message-error")).toContainText(
      "Email or password is invalid"
    );
  });

  test("valid email and invalid password", async ({ page }) => {
    await loginThroughUi(page, { email: users.candidateMany.email, password: "BadPassword123!" });

    await expect(page.locator(".auth-message.auth-message-error")).toContainText(
      "Email or password is invalid"
    );
  });

  test("invalid email and invalid password", async ({ page }) => {
    await loginThroughUi(page, { email: "bad.email", password: "bad-password" });

    await expect(page.locator(".auth-message.auth-message-error")).toContainText(
      "Email or password is invalid"
    );
  });

  test("valid email and password", async ({ page }) => {
    await loginThroughUi(page, users.candidateMany);

    await expect(page).toHaveURL(/\/job-roles/);
    await expect(page.getByRole("heading", { level: 1, name: "Open Job Roles at Kainos" })).toBeVisible();
  });
});
