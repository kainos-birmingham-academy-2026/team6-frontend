import { expect, type Locator, type Page } from "@playwright/test";

export class JobRolesPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly roleItems: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1, name: "Open Job Roles at Kainos" });
    this.roleItems = page.locator("[data-role-item]");
    this.emptyState = page.getByText("No open job roles available at the moment.");
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/job-roles/);
    await expect(this.heading).toBeVisible();
  }

  roleLinkByName(roleName: string): Locator {
    return this.page.getByRole("link", { name: roleName }).first();
  }

  firstRoleLink(): Locator {
    return this.page.locator("a.role-name-link, .featured-role h2 a").first();
  }

  firstEditLink(): Locator {
    return this.page.getByRole("link", { name: "Edit" }).first();
  }

  async openRoleByName(roleName: string): Promise<void> {
    await this.roleLinkByName(roleName).click();
  }

  async openFirstRole(): Promise<void> {
    await this.firstRoleLink().click();
  }
}
