import type { Page } from "@playwright/test";
import { LoginPage } from "../pages/login.page";

type Credentials = {
  email: string;
  password: string;
};

export async function loginThroughUi(page: Page, credentials: Credentials): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.visit();
  await loginPage.submitCredentials(credentials.email, credentials.password);
}
