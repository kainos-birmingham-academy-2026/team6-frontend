import { expect, type Locator, type Page } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator("#email");
    this.passwordInput = page.locator("#password");
    this.signInButton = page.getByRole("button", { name: "Sign In" });
    this.errorMessage = page.locator(".auth-message");
  }

  async visit(): Promise<void> {
    await this.page.goto("/login");
    await expect(this.signInButton).toBeVisible();
  }

  async submitCredentials(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}
