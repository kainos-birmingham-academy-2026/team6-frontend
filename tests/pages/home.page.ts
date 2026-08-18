import { expect, type Locator, type Page } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly heroHeading: Locator;
  readonly viewRolesCta: Locator;
  readonly lifeAtKainosCta: Locator;
  readonly activeTestimonialQuote: Locator;
  readonly nextTestimonialButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heroHeading = page.getByRole("heading", {
      level: 1,
      name: "Build Meaningful Technology With Us"
    });
    this.viewRolesCta = page.locator('a.primary-link[href="/job-roles"]').first();
    this.lifeAtKainosCta = page.locator('a.ghost-link[href="#life-at-kainos"]');
    this.activeTestimonialQuote = page.locator(".testimonial.is-active blockquote");
    this.nextTestimonialButton = page.locator("[data-testimonial-next]");
  }

  async visit(): Promise<void> {
    await this.page.goto("/");
    await expect(this.heroHeading).toBeVisible();
  }

  async goToNextTestimonial(): Promise<void> {
    await this.nextTestimonialButton.click();
  }
}
