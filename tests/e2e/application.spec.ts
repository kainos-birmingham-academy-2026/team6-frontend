import path from "path";
import { expect, test } from "@playwright/test";
import { users } from "../fixtures/test-data";
import { loginThroughUi } from "../helpers/auth";
import { getMockApplications, resetMockApi } from "../helpers/mock-api";
import { ApplyJobPage } from "../pages/apply-job.page";
import { JobRoleDetailsPage } from "../pages/job-role-details.page";
import { JobRolesPage } from "../pages/job-roles.page";

test.describe("Applying for job by submitting CV", () => {
  test.beforeEach(async ({ request }) => {
    await resetMockApi(request);
  });

  test("pdfs get attached correctly and submit button shows confirmation", async ({ page, request }) => {
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

    const applications = await getMockApplications(request);
    expect(applications).toHaveLength(1);
    expect(applications[0].fileName).toBe("cv.pdf");
    expect(applications[0].mimeType).toBe("application/pdf");
    expect(applications[0].jobRoleId).toBe(1);
  });
});
