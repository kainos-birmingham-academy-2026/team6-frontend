import { expect, type Locator, type Page } from "@playwright/test";

export class ApplyJobPage {
  readonly page: Page;
  readonly cvInput: Locator;
  readonly submitApplicationButton: Locator;
  readonly confirmationMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cvInput = page.locator("#cv");
    this.submitApplicationButton = page.getByRole("button", { name: "Submit Application" });
    this.confirmationMessage = page.getByText("Your application has been received and is now in progress.");
  }

  async expectApplyFormLoaded(roleName: string): Promise<void> {
    await expect(pageHeading(this.page, roleName)).toBeVisible();
  }

  async uploadCv(filePath: string): Promise<void> {
    await this.cvInput.setInputFiles(filePath);
  }

  async submitApplication(): Promise<void> {
    await this.submitApplicationButton.click();
  }

  async expectConfirmation(): Promise<void> {
    await expect(this.page).toHaveURL(/\/apply\/confirmation/);
    await expect(this.confirmationMessage).toBeVisible();
  }
}

function pageHeading(page: Page, roleName: string): Locator {
  return page.getByRole("heading", { level: 1, name: new RegExp(`Apply for ${roleName}`, "i") });
}
