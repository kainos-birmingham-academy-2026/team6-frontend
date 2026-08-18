import type { Page } from "@playwright/test";

type Credentials = {
  email: string;
  password: string;
};

export async function loginThroughUi(page: Page, credentials: Credentials): Promise<void> {
  await page.goto("/login");
  await page.locator("#email").fill(credentials.email);
  await page.locator("#password").fill(credentials.password);
  await page.getByRole("button", { name: "Sign In" }).click();
}
