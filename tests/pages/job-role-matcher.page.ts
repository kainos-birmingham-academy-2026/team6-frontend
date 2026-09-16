import { expect, type Locator, type Page } from "@playwright/test";

export class JobRoleMatcherPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly progressLabel: Locator;
  readonly nextButton: Locator;
  readonly submitButton: Locator;
  readonly resultsHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1, name: "Which Capability Is Right For Me?" });
    this.progressLabel = page.locator("[data-matcher-progress]");
    this.nextButton = page.locator("[data-matcher-next]");
    this.submitButton = page.locator("[data-matcher-submit]");
    this.resultsHeading = page.getByRole("heading", { level: 1, name: "Your Recommended Capabilities" });
  }

  async visit(): Promise<void> {
    await this.page.goto("/job-role-matcher");
    await expect(this.heading).toBeVisible();
  }

  visibleQuestion(): Locator {
    return this.page.locator("[data-matcher-question]:not([hidden])");
  }

  async answerVisibleQuestion(agreement: number): Promise<void> {
    await this.visibleQuestion().locator(`input[value="${agreement}"]`).check();
  }

  async goToNextQuestion(): Promise<void> {
    await this.nextButton.click();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
