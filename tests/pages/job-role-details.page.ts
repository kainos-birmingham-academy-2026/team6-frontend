import { expect, type Locator, type Page } from "@playwright/test";

export class JobRoleDetailsPage {
  readonly page: Page;
  readonly detailsHeading: Locator;
  readonly applyNowLink: Locator;
  readonly backToRolesLink: Locator;
  readonly editRoleLink: Locator;
  readonly deleteRoleButton: Locator;
  readonly editHeading: Locator;
  readonly roleNameInput: Locator;
  readonly saveChangesButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.detailsHeading = page.getByRole("heading", { level: 1, name: "Job Role Information" });
    this.applyNowLink = page.getByRole("link", { name: "Apply Now" });
    this.backToRolesLink = page.getByRole("link", { name: "Back to Job Roles" });
    this.editRoleLink = page.getByRole("link", { name: "Edit Role" });
    this.deleteRoleButton = page.getByRole("button", { name: "Delete Role" });
    this.editHeading = page.getByRole("heading", { level: 1, name: "Edit Job Role" });
    this.roleNameInput = page.locator("#roleName");
    this.saveChangesButton = page.getByRole("button", { name: "Save Changes" });
  }

  roleHeading(roleName: string): Locator {
    return this.page.getByRole("heading", { level: 2, name: roleName });
  }

  async expectLoaded(roleName?: string): Promise<void> {
    await expect(this.detailsHeading).toBeVisible();
    if (roleName) {
      await expect(this.roleHeading(roleName)).toBeVisible();
    }
  }

  async clickApplyNow(): Promise<void> {
    await this.applyNowLink.click();
  }

  async clickBackToRoles(): Promise<void> {
    await this.backToRolesLink.click();
  }

  async clickEditRole(): Promise<void> {
    await this.editRoleLink.click();
  }

  async expectEditLoaded(): Promise<void> {
    await expect(this.editHeading).toBeVisible();
  }

  async updateRoleName(newRoleName: string): Promise<void> {
    await this.roleNameInput.fill(newRoleName);
    await this.saveChangesButton.click();
  }

  async deleteRoleAndConfirm(): Promise<void> {
    this.page.once("dialog", (dialog) => dialog.accept());
    await this.deleteRoleButton.click();
  }
}
