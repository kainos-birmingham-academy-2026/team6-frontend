import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./services/jobRoleService", () => ({
  jobRoleService: {
    getOpenJobRoles: vi.fn()
  }
}));

import { app } from "./server";
import { jobRoleService } from "./services/jobRoleService";

const mockedJobRoleService = vi.mocked(jobRoleService);

describe("server endpoints", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("redirects / to /job-roles", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/job-roles");
  });

  it("renders open job roles on /job-roles", async () => {
    mockedJobRoleService.getOpenJobRoles.mockResolvedValue([
      {
        jobRoleId: 1,
        roleName: "Backend Developer",
        location: "London",
        capabilityName: "Backend Engineering",
        bandName: "Junior",
        closingDate: "2026-09-15T23:59:59.000Z",
        status: "Open"
      }
    ]);

    const response = await request(app).get("/job-roles");

    expect(response.status).toBe(200);
    expect(response.type).toContain("html");
    expect(response.text).toContain("Backend Developer");
    expect(response.text).toContain("London");
    expect(response.text).toContain("Backend Engineering");
    expect(response.text).toContain("Junior");
    expect(response.text).toContain("2026-09-15T23:59:59.000Z");
  });

  it("returns 502 when job role loading fails", async () => {
    mockedJobRoleService.getOpenJobRoles.mockRejectedValue(new Error("API unavailable"));

    const response = await request(app).get("/job-roles");

    expect(response.status).toBe(502);
    expect(response.type).toContain("html");
    expect(response.text).toContain("Unable to load job roles right now");
  });

  it("returns health payload on /health", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.type).toContain("json");
    expect(response.body.status).toBe("UP");
    expect(typeof response.body.time).toBe("string");
    expect(Number.isNaN(Date.parse(response.body.time))).toBe(false);
  });
});
