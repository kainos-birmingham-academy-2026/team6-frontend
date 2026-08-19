import { expect, type Locator, type Page } from "@playwright/test";

type JobRoleFormValues = {
  roleName: string;
  location: string;
  capability: string;
  band: string;
  closingDate: string;
  numberOfOpenPositions: string;
  description: string;
  responsibilities: string;
  sharepointUrl: string;
};

export class JobRoleFormPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly createRoleButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1, name: "Add Job Role" });
    this.createRoleButton = page.getByRole("button", { name: "Create Role" });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/job-roles\/add/);
    await expect(this.heading).toBeVisible();
  }

  async createRole(values: JobRoleFormValues): Promise<void> {
    await this.page.locator("#roleName").fill(values.roleName);
    await this.page.locator("#location").fill(values.location);
    await this.page.locator("#capabilityId").selectOption({ label: values.capability });
    await this.page.locator("#bandId").selectOption({ label: values.band });
    await this.page.locator("#closingDate").fill(values.closingDate);
    await this.page.locator("#numberOfOpenPositions").fill(values.numberOfOpenPositions);
    await this.page.locator("#description").fill(values.description);
    await this.page.locator("#responsibilities").fill(values.responsibilities);
    await this.page.locator("#sharepointUrl").fill(values.sharepointUrl);
    await this.createRoleButton.click();
  }
}