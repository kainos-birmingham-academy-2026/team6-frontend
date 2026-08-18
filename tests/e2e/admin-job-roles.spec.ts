import { expect, test } from "@playwright/test";
import { users } from "../fixtures/test-data";
import { loginThroughUi } from "../helpers/auth";
import { getMockRoles, resetMockApi } from "../helpers/mock-api";

test.describe("Admins deleting and editing job roles", () => {
  test.beforeEach(async ({ request }) => {
    await resetMockApi(request);
  });

  test("admins can edit roles and changes stay consistent", async ({ page, request }) => {
    const updatedRoleName = "Backend Engineer Updated";

    await loginThroughUi(page, users.admin);
    await expect(page).toHaveURL(/\/job-roles/);

    await page.getByRole("link", { name: "Edit" }).first().click();
    await expect(page.getByRole("heading", { level: 1, name: "Edit Job Role" })).toBeVisible();

    await page.locator("#roleName").fill(updatedRoleName);
    await page.getByRole("button", { name: "Save Changes" }).click();

    await expect(page.getByRole("heading", { level: 2, name: updatedRoleName })).toBeVisible();

    await page.goto("/job-roles");
    await expect(page.getByRole("link", { name: updatedRoleName })).toBeVisible();

    const roles = await getMockRoles(request);
    expect(roles.some((role) => role.roleName === updatedRoleName)).toBeTruthy();
  });

  test("admins can delete roles and they are removed from DB", async ({ page, request }) => {
    await loginThroughUi(page, users.admin);
    await expect(page).toHaveURL(/\/job-roles/);

    await page.getByRole("link", { name: "Backend Engineer" }).click();
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete Role" }).click();

    await expect(page).toHaveURL(/\/job-roles/);
    await expect(page.getByRole("link", { name: "Backend Engineer" })).toHaveCount(0);

    const roles = await getMockRoles(request);
    expect(roles.some((role) => role.roleName === "Backend Engineer")).toBeFalsy();
  });
});
