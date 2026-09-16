import { expect, test } from "@playwright/test";
import { users } from "../fixtures/test-data";
import { loginThroughUi } from "../helpers/auth";
import { resetMockApi } from "../helpers/mock-api";
import { JobRoleMatcherPage } from "../pages/job-role-matcher.page";
import { JobRolesPage } from "../pages/job-roles.page";

const hasCandidateCredentials = Boolean(
  process.env.E2E_CANDIDATE_EMAIL && process.env.E2E_CANDIDATE_PASSWORD
);

test.describe("Capability matcher quiz", () => {
  test.skip(!hasCandidateCredentials, "Set E2E_CANDIDATE_EMAIL and E2E_CANDIDATE_PASSWORD for the real backend.");
  test.beforeEach(async ({ request }) => {
    await resetMockApi(request);
  });

  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/job-role-matcher");

    await expect(page).toHaveURL(/\/login/);
  });

  test("entry point on job roles page links to the quiz", async ({ page }) => {
    const jobRolesPage = new JobRolesPage(page);

    await loginThroughUi(page, users.candidateMany);
    await jobRolesPage.expectLoaded();

    await page.getByRole("link", { name: "Take the quiz" }).click();

    await expect(page).toHaveURL(/\/job-role-matcher/);
  });

  test("completes the quiz and shows recommended capabilities and roles", async ({ page }) => {
    const matcherPage = new JobRoleMatcherPage(page);

    await loginThroughUi(page, users.candidateMany);
    await matcherPage.visit();

    await expect(matcherPage.progressLabel).toHaveText("Question 1 of 2");
    await matcherPage.answerVisibleQuestion(2);
    await matcherPage.goToNextQuestion();

    await expect(matcherPage.progressLabel).toHaveText("Question 2 of 2");
    await matcherPage.answerVisibleQuestion(-1);
    await matcherPage.submit();

    await expect(matcherPage.resultsHeading).toBeVisible();
    await expect(page.getByRole("heading", { name: "Engineering", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Backend Engineer" })).toBeVisible();

    await page.getByRole("link", { name: "Backend Engineer" }).click();
    await expect(page.getByRole("heading", { name: "Backend Engineer" })).toBeVisible();
  });

  test("shows an empty state when the recommended capability has no open roles", async ({ page }) => {
    const matcherPage = new JobRoleMatcherPage(page);

    await loginThroughUi(page, users.candidateEmpty);
    await matcherPage.visit();

    await matcherPage.answerVisibleQuestion(2);
    await matcherPage.goToNextQuestion();
    await matcherPage.answerVisibleQuestion(-1);
    await matcherPage.submit();

    await expect(matcherPage.resultsHeading).toBeVisible();
    await expect(
      page.getByText("These capabilities may suit you, but there are no open roles matching your result right now.")
    ).toBeVisible();
  });
});
