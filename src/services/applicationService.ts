import axios, { AxiosError, type AxiosInstance } from "axios";
import FormData from "form-data";

export type ApplicationCvFile = {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
};

export type ApplicationSubmission = {
  jobRoleId: string | number;
  cvFile: ApplicationCvFile;
};

type ErrorPayload = {
  error?: string;
  message?: string;
};

export class ApplicationService {
  private readonly client: AxiosInstance;

  constructor(
    private readonly apiBaseUrl: string = process.env.API_BASE_URL || "http://localhost:3000"
  ) {
    this.client = axios.create({
      baseURL: this.apiBaseUrl,
      timeout: 10000
    });
  }

  async submitApplication(submission: ApplicationSubmission, token?: string): Promise<void> {
    const formData = new FormData();
    formData.append("jobRoleId", String(submission.jobRoleId));
    formData.append("cv", submission.cvFile.buffer, {
      filename: submission.cvFile.originalName,
      contentType: submission.cvFile.mimeType
    });

    const headers: Record<string, string> = formData.getHeaders();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      await this.client.post(`/job-roles/${submission.jobRoleId}/apply`, formData, {
        headers
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          this.extractBackendMessage(error.response?.data) ||
            "Unable to submit your application right now."
        );
      }

      throw error;
    }
  }

  private extractBackendMessage(data: unknown): string | null {
    if (!data || typeof data !== "object") {
      return null;
    }

    const payload = data as ErrorPayload;
    return payload.message || payload.error || null;
  }
}

export const applicationService = new ApplicationService();
