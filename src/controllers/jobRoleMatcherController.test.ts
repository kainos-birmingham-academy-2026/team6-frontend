import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/jobRoleMatcherService", () => ({
  jobRoleMatcherService: {
    getQuestions: vi.fn(),
    submitAnswers: vi.fn()
  }
}));

vi.mock("../services/authService", () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn()
  }
}));

import { app } from "../server";
import { authService } from "../services/authService";
import { BackendRequestError } from "../services/jobRoleService";
import { jobRoleMatcherService } from "../services/jobRoleMatcherService";

const mockedAuthService = vi.mocked(authService);
const mockedMatcherService = vi.mocked(jobRoleMatcherService);

const questions = [
  { questionId: 1, text: "I enjoy building systems.", capabilityName: "Engineering" },
  { questionId: 2, text: "I enjoy client conversations.", capabilityName: "Consulting" }
];

const loginAsCandidate = async () => {
  mockedAuthService.login.mockResolvedValueOnce({
    token: "candidate-jwt-token",
    user: { userid: 2, email: "candidate@kainos.com", role: "candidate" }
  });

  const agent = request.agent(app);
  await agent.post("/login").type("form").send({
    email: "candidate@kainos.com",
    password: "Password123!"
  });

  return agent;
};

describe("job role matcher", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated users to /login on GET /job-role-matcher", async () => {
    const response = await request(app).get("/job-role-matcher");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/login");
  });

  it("redirects unauthenticated users to /login on POST /job-role-matcher", async () => {
    const response = await request(app).post("/job-role-matcher").send({ answers: "[]" });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/login");
  });

  it("renders the questionnaire for a logged-in user", async () => {
    mockedMatcherService.getQuestions.mockResolvedValueOnce(questions);
    const agent = await loginAsCandidate();

    const response = await agent.get("/job-role-matcher");

    expect(response.status).toBe(200);
    expect(response.text).toContain("I enjoy building systems.");
    expect(response.text).toContain("I enjoy client conversations.");
  });

  it("shows a friendly error when questions fail to load", async () => {
    mockedMatcherService.getQuestions.mockRejectedValueOnce(new Error("network down"));
    const agent = await loginAsCandidate();

    const response = await agent.get("/job-role-matcher");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Unable to load the quiz right now");
  });

  it("logs the user out and redirects on a 401 while loading questions", async () => {
    mockedMatcherService.getQuestions.mockRejectedValueOnce(
      new BackendRequestError("Failed to fetch matcher questions: 401", 401)
    );
    const agent = await loginAsCandidate();

    const response = await agent.get("/job-role-matcher");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/login");
  });

  it("rejects a submission missing a required questionId", async () => {
    mockedMatcherService.getQuestions.mockResolvedValue(questions);
    const agent = await loginAsCandidate();

    const response = await agent
      .post("/job-role-matcher")
      .type("form")
      .send({ answers: JSON.stringify([{ questionId: 1, agreement: 2 }]) });

    expect(response.status).toBe(200);
    expect(response.text).toContain("Please answer every question before submitting.");
    expect(mockedMatcherService.submitAnswers).not.toHaveBeenCalled();
  });

  it("rejects a submission with an out-of-range agreement value", async () => {
    mockedMatcherService.getQuestions.mockResolvedValue(questions);
    const agent = await loginAsCandidate();

    const response = await agent
      .post("/job-role-matcher")
      .type("form")
      .send({
        answers: JSON.stringify([
          { questionId: 1, agreement: 5 },
          { questionId: 2, agreement: 0 }
        ])
      });

    expect(response.status).toBe(200);
    expect(response.text).toContain("Please answer every question before submitting.");
    expect(mockedMatcherService.submitAnswers).not.toHaveBeenCalled();
  });

  it("rejects a submission with an unknown questionId", async () => {
    mockedMatcherService.getQuestions.mockResolvedValue(questions);
    const agent = await loginAsCandidate();

    const response = await agent
      .post("/job-role-matcher")
      .type("form")
      .send({
        answers: JSON.stringify([
          { questionId: 999, agreement: 1 },
          { questionId: 2, agreement: 0 }
        ])
      });

    expect(response.status).toBe(200);
    expect(response.text).toContain("Please answer every question before submitting.");
    expect(mockedMatcherService.submitAnswers).not.toHaveBeenCalled();
  });

  it("rejects a submission with a duplicate questionId", async () => {
    mockedMatcherService.getQuestions.mockResolvedValue(questions);
    const agent = await loginAsCandidate();

    const response = await agent
      .post("/job-role-matcher")
      .type("form")
      .send({
        answers: JSON.stringify([
          { questionId: 1, agreement: 1 },
          { questionId: 1, agreement: -1 }
        ])
      });

    expect(response.status).toBe(200);
    expect(response.text).toContain("Please answer every question before submitting.");
    expect(mockedMatcherService.submitAnswers).not.toHaveBeenCalled();
  });

  it("renders recommendations and matching roles on a valid submission", async () => {
    mockedMatcherService.getQuestions.mockResolvedValue(questions);
    mockedMatcherService.submitAnswers.mockResolvedValueOnce({
      recommendations: [
        { capabilityName: "Engineering", score: 4 },
        { capabilityName: "Consulting", score: 2 }
      ],
      matchingRoles: [
        {
          jobRoleId: 1,
          roleName: "Backend Engineer",
          description: "Build resilient APIs.",
          responsibilities: "Own backend services",
          sharepointUrl: "https://example.com/roles/1",
          location: "Belfast",
          capabilityName: "Engineering",
          capabilityId: 1,
          bandName: "Senior",
          bandId: 2,
          closingDate: "2026-12-31T00:00:00.000Z",
          statusName: "open",
          numberOfOpenPositions: 2
        }
      ]
    });
    const agent = await loginAsCandidate();

    const response = await agent
      .post("/job-role-matcher")
      .type("form")
      .send({
        answers: JSON.stringify([
          { questionId: 1, agreement: 2 },
          { questionId: 2, agreement: 1 }
        ])
      });

    expect(response.status).toBe(200);
    expect(response.text).toContain("Engineering");
    expect(response.text).toContain("Backend Engineer");
    expect(mockedMatcherService.submitAnswers).toHaveBeenCalledWith(
      [
        { questionId: 1, agreement: 2 },
        { questionId: 2, agreement: 1 }
      ],
      "candidate-jwt-token"
    );
  });

  it("shows an empty-state message when no roles match the recommendation", async () => {
    mockedMatcherService.getQuestions.mockResolvedValue(questions);
    mockedMatcherService.submitAnswers.mockResolvedValueOnce({
      recommendations: [{ capabilityName: "Engineering", score: 4 }],
      matchingRoles: []
    });
    const agent = await loginAsCandidate();

    const response = await agent
      .post("/job-role-matcher")
      .type("form")
      .send({
        answers: JSON.stringify([
          { questionId: 1, agreement: 2 },
          { questionId: 2, agreement: 1 }
        ])
      });

    expect(response.status).toBe(200);
    expect(response.text).toContain("no open roles matching your result");
  });

  it("logs the user out and redirects on a 401 while submitting answers", async () => {
    mockedMatcherService.getQuestions.mockResolvedValue(questions);
    mockedMatcherService.submitAnswers.mockRejectedValueOnce(
      new BackendRequestError("Failed to submit matcher answers: 401", 401)
    );
    const agent = await loginAsCandidate();

    const response = await agent
      .post("/job-role-matcher")
      .type("form")
      .send({
        answers: JSON.stringify([
          { questionId: 1, agreement: 2 },
          { questionId: 2, agreement: 1 }
        ])
      });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/login");
  });
});
