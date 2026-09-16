import axios, { AxiosError, type AxiosInstance } from "axios";
import { BackendRequestError, type BackendJobRole } from "./jobRoleService";

export type MatcherQuestion = {
  questionId: number;
  text: string;
  capabilityName: string;
};

export type MatcherAnswer = {
  questionId: number;
  agreement: number;
};

export type MatcherRecommendation = {
  capabilityName: string;
  score: number;
};

export type MatcherSubmitResult = {
  recommendations: MatcherRecommendation[];
  matchingRoles: BackendJobRole[];
};

type ErrorPayload = {
  error?: string;
  details?: Array<{ message?: string }>;
};

export class JobRoleMatcherService {
  private readonly client: AxiosInstance;

  constructor(
    private readonly apiBaseUrl: string = process.env.API_BASE_URL || "http://localhost:3000"
  ) {
    this.client = axios.create({
      baseURL: this.apiBaseUrl,
      timeout: 5000
    });
  }

  private buildAuthHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private extractBackendMessage(data: unknown): string | null {
    if (!data || typeof data !== "object") {
      return null;
    }

    const payload = data as ErrorPayload;
    if (Array.isArray(payload.details) && payload.details.length > 0) {
      const firstDetail = payload.details.find((detail) => typeof detail.message === "string");
      if (firstDetail?.message) {
        return firstDetail.message;
      }
    }

    return payload.error || null;
  }

  async getQuestions(token?: string): Promise<MatcherQuestion[]> {
    try {
      const response = await this.client.get<MatcherQuestion[]>("/job-role-matcher/questions", {
        headers: this.buildAuthHeaders(token)
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new BackendRequestError(
          `Failed to fetch matcher questions: ${error.response?.status ?? "unknown"}`,
          error.response?.status
        );
      }

      throw error;
    }
  }

  async submitAnswers(answers: MatcherAnswer[], token?: string): Promise<MatcherSubmitResult> {
    try {
      const response = await this.client.post<MatcherSubmitResult>(
        "/job-role-matcher/submit",
        { answers },
        { headers: this.buildAuthHeaders(token) }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          throw new BackendRequestError(
            "Failed to submit matcher answers: 401",
            error.response.status
          );
        }

        throw new Error(
          this.extractBackendMessage(error.response?.data) || "Unable to submit your answers."
        );
      }

      throw error;
    }
  }
}

export const jobRoleMatcherService = new JobRoleMatcherService();
