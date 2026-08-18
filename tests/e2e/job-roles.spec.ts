import { expect, test } from "@playwright/test";
import { users } from "../fixtures/test-data";
import { loginThroughUi } from "../helpers/auth";
import { resetMockApi } from "../helpers/mock-api";
import { JobRoleDetailsPage } from "../pages/job-role-details.page";
import { JobRolesPage } from "../pages/job-roles.page";

test.describe("Viewing job roles", () => {
  test.beforeEach(async ({ request }) => {
    await resetMockApi(request);
  });

  test("no job roles to view", async ({ page }) => {
    const jobRolesPage = new JobRolesPage(page);

    await loginThroughUi(page, users.candidateEmpty);

    await jobRolesPage.expectLoaded();
    await expect(jobRolesPage.emptyState).toBeVisible();
  });

  test("1 job role to view", async ({ page }) => {
    const jobRolesPage = new JobRolesPage(page);

    await loginThroughUi(page, users.candidateOne);

    await jobRolesPage.expectLoaded();
    await expect(jobRolesPage.roleItems).toHaveCount(1);
    await expect(jobRolesPage.roleLinkByName("Single Role Tester")).toBeVisible();
  });

  test("lots of job roles to view", async ({ page }) => {
    const jobRolesPage = new JobRolesPage(page);

    await loginThroughUi(page, users.candidateMany);

    await jobRolesPage.expectLoaded();
    expect(await jobRolesPage.roleItems.count()).toBeGreaterThan(1);
  });
});

test.describe("Viewing correct job details", () => {
  test.beforeEach(async ({ request }) => {
    await resetMockApi(request);
  });

  test("correct information for each job role", async ({ page }) => {
    const jobRolesPage = new JobRolesPage(page);
    const detailsPage = new JobRoleDetailsPage(page);

    await loginThroughUi(page, users.candidateMany);

    await jobRolesPage.openRoleByName("Backend Engineer");

    await detailsPage.expectLoaded("Backend Engineer");
    await expect(page.locator("article.info-panel").first()).toContainText("Location");
    await expect(page.locator("article.info-panel").first()).toContainText("Belfast");
    await expect(page.getByText("Engineering")).toBeVisible();
    await expect(page.getByText("Senior")).toBeVisible();
    await expect(page.getByText("Own backend services")).toBeVisible();
  });
});
