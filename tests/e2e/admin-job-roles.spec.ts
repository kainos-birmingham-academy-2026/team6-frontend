import { expect, test } from "@playwright/test";
import { users } from "../fixtures/test-data";
import { loginThroughUi } from "../helpers/auth";
import { resetMockApi } from "../helpers/mock-api";
import { JobRoleDetailsPage } from "../pages/job-role-details.page";
import { JobRoleFormPage } from "../pages/job-role-form.page";
import { JobRolesPage } from "../pages/job-roles.page";

const hasAdminCredentials = Boolean(process.env.E2E_ADMIN_EMAIL && process.env.E2E_ADMIN_PASSWORD);

test.describe("Admins deleting and editing job roles", () => {
  test.skip(!hasAdminCredentials, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD for the real backend.");
  test.beforeEach(async ({ request }) => {
    await resetMockApi(request);
  });

  test("admin can create a new role", async ({ page }) => {
    const newRoleName = `BDD Test Role ${Date.now()}`;
    const jobRolesPage = new JobRolesPage(page);
    const jobRoleFormPage = new JobRoleFormPage(page);

    await loginThroughUi(page, users.admin);
    await jobRolesPage.expectLoaded();

    await page.getByRole("link", { name: "Add New Role" }).click();
    await jobRoleFormPage.expectLoaded();

    await jobRoleFormPage.createRole({
      roleName: newRoleName,
      location: "Belfast",
      capability: "Engineering",
      band: "Associate",
      closingDate: "2030-12-31",
      numberOfOpenPositions: "1",
      description: "A role created by the BDD end-to-end test.",
      responsibilities: "Build and maintain software.",
      sharepointUrl: "https://example.com/job-role"
    });

    await jobRolesPage.expectLoaded();
    await expect(jobRolesPage.roleLinkByName(newRoleName)).toBeVisible();
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
