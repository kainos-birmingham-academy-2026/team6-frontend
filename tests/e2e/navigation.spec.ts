import { expect, test } from "@playwright/test";
import { users } from "../fixtures/test-data";
import { loginThroughUi } from "../helpers/auth";
import { resetMockApi } from "../helpers/mock-api";
import { HomePage } from "../pages/home.page";
import { JobRoleDetailsPage } from "../pages/job-role-details.page";
import { JobRolesPage } from "../pages/job-roles.page";
import { LoginPage } from "../pages/login.page";
import { RegisterPage } from "../pages/register.page";

const hasCandidateCredentials = Boolean(
  process.env.E2E_CANDIDATE_EMAIL && process.env.E2E_CANDIDATE_PASSWORD
);

test.describe("Navigating pages", () => {
  test.beforeEach(async ({ request }) => {
    await resetMockApi(request);
  });

  test("buttons between pages work correctly", async ({ page }) => {
    test.skip(!hasCandidateCredentials, "Set E2E_CANDIDATE_EMAIL and E2E_CANDIDATE_PASSWORD for the real backend.");
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const registerPage = new RegisterPage(page);
    const jobRolesPage = new JobRolesPage(page);
    const detailsPage = new JobRoleDetailsPage(page);

    await homePage.visit();
    await page.getByRole("link", { name: "Login" }).click();
    await expect(page).toHaveURL(/\/login/);

    await loginPage.createAccountLink.click();
    await registerPage.expectLoaded();

    await registerPage.signInLink.click();
    await expect(page).toHaveURL(/\/login/);

    await loginThroughUi(page, users.candidateMany);
    await jobRolesPage.expectLoaded();

    await jobRolesPage.openFirstRole();
    await expect(page).toHaveURL(/\/job-roles\/\d+$/);

    await detailsPage.clickBackToRoles();
    await jobRolesPage.expectLoaded();
  });
});
