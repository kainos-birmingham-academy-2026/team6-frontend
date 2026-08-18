import { expect, test } from "@playwright/test";
import { users } from "../fixtures/test-data";
import { loginThroughUi } from "../helpers/auth";
import { resetMockApi } from "../helpers/mock-api";

test.describe("Viewing job roles", () => {
  test.beforeEach(async ({ request }) => {
    await resetMockApi(request);
  });

  test("no job roles to view", async ({ page }) => {
    await loginThroughUi(page, users.candidateEmpty);

    await expect(page).toHaveURL(/\/job-roles/);
    await expect(page.getByText("No open job roles available at the moment.")).toBeVisible();
  });

  test("1 job role to view", async ({ page }) => {
    await loginThroughUi(page, users.candidateOne);

    await expect(page).toHaveURL(/\/job-roles/);
    await expect(page.locator("[data-role-item]")).toHaveCount(1);
    await expect(page.getByRole("link", { name: "Single Role Tester" })).toBeVisible();
  });

  test("lots of job roles to view", async ({ page }) => {
    await loginThroughUi(page, users.candidateMany);

    await expect(page).toHaveURL(/\/job-roles/);
    const roleItems = page.locator("[data-role-item]");
    expect(await roleItems.count()).toBeGreaterThan(1);
  });
});

test.describe("Viewing correct job details", () => {
  test.beforeEach(async ({ request }) => {
    await resetMockApi(request);
  });

  test("correct information for each job role", async ({ page }) => {
    await loginThroughUi(page, users.candidateMany);

    await page.getByRole("link", { name: "Backend Engineer" }).first().click();

    await expect(page.getByRole("heading", { level: 1, name: "Job Role Information" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Backend Engineer" })).toBeVisible();
    await expect(page.locator("article.info-panel").first()).toContainText("Location");
    await expect(page.locator("article.info-panel").first()).toContainText("Belfast");
    await expect(page.getByText("Engineering")).toBeVisible();
    await expect(page.getByText("Senior")).toBeVisible();
    await expect(page.getByText("Own backend services")).toBeVisible();
  });
});
