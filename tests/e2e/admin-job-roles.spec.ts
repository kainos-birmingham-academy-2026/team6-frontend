import { expect, test } from "@playwright/test";
import { users } from "../fixtures/test-data";
import { loginThroughUi } from "../helpers/auth";
import { resetMockApi } from "../helpers/mock-api";
import { JobRoleDetailsPage } from "../pages/job-role-details.page";
import { JobRolesPage } from "../pages/job-roles.page";

const hasAdminCredentials = Boolean(process.env.E2E_ADMIN_EMAIL && process.env.E2E_ADMIN_PASSWORD);

test.describe("Admins deleting and editing job roles", () => {
  test.skip(!hasAdminCredentials, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD for the real backend.");
  test.beforeEach(async ({ request }) => {
    await resetMockApi(request);
  });

  test("admins can edit roles and changes stay consistent", async ({ page }) => {
    const updatedRoleName = "Backend Engineer Updated";
    const jobRolesPage = new JobRolesPage(page);
    const detailsPage = new JobRoleDetailsPage(page);

    await loginThroughUi(page, users.admin);
    await jobRolesPage.expectLoaded();

    await jobRolesPage.openRoleByName("Backend Engineer");
    await detailsPage.expectLoaded("Backend Engineer");
    await detailsPage.clickEditRole();
    await detailsPage.expectEditLoaded();

    await detailsPage.updateRoleName(updatedRoleName);

    await expect(detailsPage.roleHeading(updatedRoleName)).toBeVisible();

    await page.goto("/job-roles");
    await jobRolesPage.expectLoaded();
    await expect(jobRolesPage.roleLinkByName(updatedRoleName)).toBeVisible();
  });

  test("admins can delete roles and they are removed from DB", async ({ page }) => {
    const jobRolesPage = new JobRolesPage(page);
    const detailsPage = new JobRoleDetailsPage(page);

    await loginThroughUi(page, users.admin);
    await jobRolesPage.expectLoaded();

    await jobRolesPage.openRoleByName("Backend Engineer");
    await detailsPage.deleteRoleAndConfirm();

    await jobRolesPage.expectLoaded();
    await expect(jobRolesPage.roleLinkByName("Backend Engineer")).toHaveCount(0);
  });
});
