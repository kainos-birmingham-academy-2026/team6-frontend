import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./services/jobRoleService", () => ({
  jobRoleService: {
    getOpenJobRoles: vi.fn(),
    getJobRoleById: vi.fn()
  }
}));

vi.mock("./services/authService", () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn()
  }
}));

import { app } from "./server";
import { authService } from "./services/authService";
import { jobRoleService } from "./services/jobRoleService";

const mockedJobRoleService = vi.mocked(jobRoleService);
const mockedAuthService = vi.mocked(authService);

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

  it("renders login page on /login", async () => {
    const response = await request(app).get("/login");

    expect(response.status).toBe(200);
    expect(response.type).toContain("html");
    expect(response.text).toContain("Welcome Back");
    expect(response.text).toContain("Email Address");
    expect(response.text).toContain("Password");
  });

  it("renders register page on /register", async () => {
    const response = await request(app).get("/register");

    expect(response.status).toBe(200);
    expect(response.type).toContain("html");
    expect(response.text).toContain("Create Your Account");
    expect(response.text).toContain("Email Address");
    expect(response.text).toContain("Password");
    expect(response.text).toContain("Create Account");
  });

  it("redirects to job roles when login succeeds", async () => {
    mockedAuthService.login.mockResolvedValue({
      token: "jwt-token",
      user: {
        userid: 1,
        email: "user@kainos.com",
        role: "candidate"
      }
    });

    const response = await request(app).post("/login").type("form").send({
      email: "user@kainos.com",
      password: "Password123!"
    });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/job-roles");
    expect(mockedAuthService.login).toHaveBeenCalledWith({
      email: "user@kainos.com",
      password: "Password123!"
    });
  });

  it("renders backend validation message when login fails", async () => {
    mockedAuthService.login.mockRejectedValue(new Error("Email or password is invalid."));

    const response = await request(app).post("/login").type("form").send({
      email: "bad-email",
      password: "123"
    });

    expect(response.status).toBe(401);
    expect(response.type).toContain("html");
    expect(response.text).toContain("Email or password is invalid.");
    expect(response.text).toContain('value="bad-email"');
  });

  it("keeps user signed in and redirects /login after successful auth", async () => {
    mockedAuthService.login.mockResolvedValue({
      token: "jwt-token",
      user: {
        userid: 1,
        email: "user@kainos.com",
        role: "candidate"
      }
    });

    const agent = request.agent(app);

    const loginResponse = await agent.post("/login").type("form").send({
      email: "user@kainos.com",
      password: "Password123!"
    });

    expect(loginResponse.status).toBe(302);
    expect(loginResponse.headers.location).toBe("/job-roles");

    const revisitLoginResponse = await agent.get("/login");

    expect(revisitLoginResponse.status).toBe(302);
    expect(revisitLoginResponse.headers.location).toBe("/job-roles");
  });

  it("shows sign out button in nav after login", async () => {
    mockedAuthService.login.mockResolvedValue({
      token: "jwt-token",
      user: {
        userid: 1,
        email: "user@kainos.com",
        role: "candidate"
      }
    });

    const agent = request.agent(app);

    await agent.post("/login").type("form").send({
      email: "user@kainos.com",
      password: "Password123!"
    });

    const response = await agent.get("/");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Sign Out");
    expect(response.text).not.toContain('href="/login" class="nav-link">Login</a>');
  });

  it("logs user out and returns login link in nav", async () => {
    mockedAuthService.login.mockResolvedValue({
      token: "jwt-token",
      user: {
        userid: 1,
        email: "user@kainos.com",
        role: "candidate"
      }
    });

    const agent = request.agent(app);

    await agent.post("/login").type("form").send({
      email: "user@kainos.com",
      password: "Password123!"
    });

    const logoutResponse = await agent.post("/logout");

    expect(logoutResponse.status).toBe(302);
    expect(logoutResponse.headers.location).toBe("/login");

    const response = await agent.get("/");

    expect(response.status).toBe(200);
    expect(response.text).toContain('href="/login" class="nav-link">Login</a>');
    expect(response.text).not.toContain("Sign Out");
  });

  it("redirects to login when register succeeds", async () => {
    mockedAuthService.register.mockResolvedValue({
      token: "jwt-token",
      user: {
        userid: 2,
        email: "new.user@kainos.com",
        role: "candidate"
      }
    });

    const response = await request(app).post("/register").type("form").send({
      email: "new.user@kainos.com",
      password: "Password123!"
    });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/login");
    expect(mockedAuthService.register).toHaveBeenCalledWith({
      email: "new.user@kainos.com",
      password: "Password123!"
    });
  });

  it("renders backend validation message when register fails", async () => {
    mockedAuthService.register.mockRejectedValue(new Error("Password must contain at least 8 characters."));

    const response = await request(app).post("/register").type("form").send({
      email: "new.user@kainos.com",
      password: "short"
    });

    expect(response.status).toBe(401);
    expect(response.type).toContain("html");
    expect(response.text).toContain("Password must contain at least 8 characters.");
    expect(response.text).toContain('value="new.user@kainos.com"');
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
