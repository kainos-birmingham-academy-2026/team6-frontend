import { expect, test } from "@playwright/test";

test.describe("Health endpoint", () => {
  test("returns UP status and a valid timestamp", async ({ request }) => {
    const response = await request.get("/health");
    expect(response.ok()).toBeTruthy();

    const payload = (await response.json()) as { status: string; time: string };
    expect(payload.status).toBe("UP");
    expect(Number.isNaN(Date.parse(payload.time))).toBe(false);
  });
});
