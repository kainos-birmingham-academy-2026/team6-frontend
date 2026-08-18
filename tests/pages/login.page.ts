import { expect, type Locator, type Page } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly createAccountLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator("#email");
    this.passwordInput = page.locator("#password");
    this.signInButton = page.getByRole("button", { name: "Sign In" });
    this.createAccountLink = page.getByRole("link", { name: "Create an account" });
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

  errorMessage(text: string): Locator {
    return this.page.locator(".auth-message.auth-message-error").filter({ hasText: text });
  }
}
