import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./services/jobRoleService", () => ({
  jobRoleService: {
    getOpenJobRoles: vi.fn(),
    getJobRoleById: vi.fn()
  }
}));

import { app } from "./server";
import { jobRoleService } from "./services/jobRoleService";

const mockedJobRoleService = vi.mocked(jobRoleService);

describe("server endpoints", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders home page on /", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.type).toContain("html");
    expect(response.text).toContain("Kainos Careers Home");
    expect(response.text).toContain("/job-roles");
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
    expect(response.text).toContain("15/09/26");
    expect(response.text).toContain('href="/job-roles/1"');
    expect(response.text).toContain("View More Info");
  });

  it("renders details links when list payload has no jobRoleId", async () => {
    mockedJobRoleService.getOpenJobRoles.mockResolvedValue([
      {
        roleName: "Backend Developer",
        location: "London",
        capabilityName: "Backend Engineering",
        bandName: "Junior",
        closingDate: "2026-09-15T23:59:59.000Z"
      }
    ]);

    const response = await request(app).get("/job-roles");

    expect(response.status).toBe(200);
    expect(response.text).toContain('href="/job-roles/1"');
    expect(response.text).not.toContain("Unavailable");
  });

  it("renders role details on /job-roles/:id", async () => {
    mockedJobRoleService.getJobRoleById.mockResolvedValue({
      jobRoleId: 1,
      roleName: "Senior Backend Developer",
      description: "We are looking for an experienced backend developer",
      responsibilities: "Build and maintain backend services",
      sharepointUrl: "https://sharepoint.example.com/jobs/1",
      location: "Birmingham",
      capabilityName: "Backend Development",
      bandName: "Band 5",
      closingDate: "2026-12-31T00:00:00.000Z",
      statusName: "open",
      numberOfOpenPositions: 2
    });

    const response = await request(app).get("/job-roles/1");

    expect(response.status).toBe(200);
    expect(response.type).toContain("html");
    expect(response.text).toContain("Senior Backend Developer");
    expect(response.text).toContain("Build and maintain backend services");
    expect(response.text).toContain("31/12/26");
    expect(response.text).toContain("open");
    expect(response.text).toContain("2");
    expect(response.text).not.toContain("jobRoleId");
  });

  it("returns 502 when role details loading fails", async () => {
    mockedJobRoleService.getJobRoleById.mockRejectedValue(new Error("API unavailable"));

    const response = await request(app).get("/job-roles/1");

    expect(response.status).toBe(502);
    expect(response.type).toContain("html");
    expect(response.text).toContain("Unable to load this role right now");
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
