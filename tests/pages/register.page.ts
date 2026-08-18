import { expect, type Locator, type Page } from "@playwright/test";

export class RegisterPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly signInLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1, name: "Create Your Account" });
    this.signInLink = page.getByRole("link", { name: "Sign in" });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/register/);
    await expect(this.heading).toBeVisible();
  }
}
