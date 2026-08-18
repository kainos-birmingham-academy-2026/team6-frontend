import path from "path";
import { test } from "@playwright/test";
import { users } from "../fixtures/test-data";
import { loginThroughUi } from "../helpers/auth";
import { resetMockApi } from "../helpers/mock-api";
import { ApplyJobPage } from "../pages/apply-job.page";
import { JobRoleDetailsPage } from "../pages/job-role-details.page";
import { JobRolesPage } from "../pages/job-roles.page";

const hasCandidateCredentials = Boolean(
  process.env.E2E_CANDIDATE_EMAIL && process.env.E2E_CANDIDATE_PASSWORD
);

test.describe("Applying for job by submitting CV", () => {
  test.skip(!hasCandidateCredentials, "Set E2E_CANDIDATE_EMAIL and E2E_CANDIDATE_PASSWORD for the real backend.");
  test.beforeEach(async ({ request }) => {
    await resetMockApi(request);
  });

  test("pdfs get attached correctly and submit button shows confirmation", async ({ page }) => {
    const pdfPath = path.resolve(__dirname, "../fixtures/files/cv.pdf");
    const jobRolesPage = new JobRolesPage(page);
    const detailsPage = new JobRoleDetailsPage(page);
    const applyJobPage = new ApplyJobPage(page);

    await loginThroughUi(page, users.candidateMany);
    await jobRolesPage.openRoleByName("Backend Engineer");
    await detailsPage.clickApplyNow();

    await applyJobPage.expectApplyFormLoaded("Backend Engineer");

    await applyJobPage.uploadCv(pdfPath);
    await applyJobPage.submitApplication();

    await applyJobPage.expectConfirmation();
  });
});
