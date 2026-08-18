import path from "path";
import { expect, test } from "@playwright/test";
import { users } from "../fixtures/test-data";
import { loginThroughUi } from "../helpers/auth";
import { getMockApplications, resetMockApi } from "../helpers/mock-api";

test.describe("Applying for job by submitting CV", () => {
  test.beforeEach(async ({ request }) => {
    await resetMockApi(request);
  });

  test("pdfs get attached correctly and submit button shows confirmation", async ({ page, request }) => {
    const pdfPath = path.resolve(__dirname, "../fixtures/files/cv.pdf");

    await loginThroughUi(page, users.candidateMany);
    await page.locator('a[href="/job-roles/1"]').first().click();
    await page.getByRole("link", { name: "Apply Now" }).click();

    await expect(page.getByRole("heading", { level: 1, name: /Apply for Backend Engineer/i })).toBeVisible();

    await page.locator("#cv").setInputFiles(pdfPath);
    await page.getByRole("button", { name: "Submit Application" }).click();

    await expect(page).toHaveURL(/\/apply\/confirmation/);
    await expect(page.getByText("Your application has been received and is now in progress.")).toBeVisible();

    const applications = await getMockApplications(request);
    expect(applications).toHaveLength(1);
    expect(applications[0].fileName).toBe("cv.pdf");
    expect(applications[0].mimeType).toBe("application/pdf");
    expect(applications[0].jobRoleId).toBe(1);
  });
});
