import { expect, test } from "@playwright/test";
import { HomePage } from "../pages/home.page";

test.describe("Home page", () => {
  test("shows core hero content and primary actions", async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.visit();

    await expect(page).toHaveTitle(/Kainos Careers Home/i);
    await expect(homePage.viewRolesCta).toBeVisible();
    await expect(homePage.lifeAtKainosCta).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Find the team where you belong" })).toBeVisible();
  });

  test("supports testimonial carousel navigation", async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.visit();

    const firstQuote = (await homePage.activeTestimonialQuote.textContent())?.trim();
    await homePage.goToNextTestimonial();
    await expect(homePage.activeTestimonialQuote).toBeVisible();
    const secondQuote = (await homePage.activeTestimonialQuote.textContent())?.trim();

    expect(firstQuote).toBeTruthy();
    expect(secondQuote).toBeTruthy();
    expect(secondQuote).not.toEqual(firstQuote);
  });

  test("shows key marketing sections and footer links", async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.visit();

    await expect(page.getByRole("heading", { level: 2, name: "Our people are at the heart of everything" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Rewards that go beyond the salary" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Five steps from application to offer" })).toBeVisible();
    await expect(page.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/company/kainos/"
    );
  });

  test("navigates from hero call-to-action to job roles path", async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.visit();
    await homePage.viewRolesCta.click();

    await expect(page).toHaveURL(/\/(job-roles|login)/);
  });
});
