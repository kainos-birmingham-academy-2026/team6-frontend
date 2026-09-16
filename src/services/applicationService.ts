import axios, { AxiosError, type AxiosInstance } from "axios";
import FormData from "form-data";
import { BackendRequestError } from "./jobRoleService";

export type ApplicationCvFile = {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
};

export type ApplicationSubmission = {
  jobRoleId: string | number;
  cvFile: ApplicationCvFile;
};

export type BackendMyApplication = {
  applicationId: number;
  applicationStatusName: string;
  jobRoleId: number;
  roleName: string;
  location: string;
  capabilityName: string;
  bandName: string;
  closingDate: string;
};

export type BackendAdminApplication = {
  applicationId: number;
  userId: number;
  email: string;
  applicationStatusName: string;
  jobRoleId: number;
  roleName: string;
};

export type BackendJobRoleApplicant = {
  applicationId: number;
  userId: number;
  email: string;
  applicationStatusName: string;
  cv: string;
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
        throw new BackendRequestError(
          this.extractBackendMessage(error.response?.data) ||
            "Unable to submit your application right now.",
          error.response?.status
        );
      }

      throw error;
    }
  }

  async getMyApplications(token?: string): Promise<BackendMyApplication[]> {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await this.client.get<BackendMyApplication[]>("/applications", {
        headers
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new BackendRequestError(
          this.extractBackendMessage(error.response?.data) ||
            "Unable to load your applications right now.",
          error.response?.status
        );
      }

      throw error;
    }
  }

  // Same endpoint as getMyApplications, but returns every applicant when called as an admin.
  async getAllApplications(token?: string): Promise<BackendAdminApplication[]> {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await this.client.get<BackendAdminApplication[]>("/applications", {
        headers
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new BackendRequestError(
          this.extractBackendMessage(error.response?.data) ||
            "Unable to load applications right now.",
          error.response?.status
        );
      }

      throw error;
    }
  }

  async getApplicationsByJobRoleId(
    jobRoleId: string | number,
    token?: string
  ): Promise<BackendJobRoleApplicant[]> {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await this.client.get<BackendJobRoleApplicant[]>(
        `/applications/job-role/${jobRoleId}`,
        { headers }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new BackendRequestError(
          this.extractBackendMessage(error.response?.data) ||
            "Unable to load applicants for this role right now.",
          error.response?.status
        );
      }

      throw error;
    }
  }

  async hireApplicant(applicationId: string | number, token?: string): Promise<void> {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      await this.client.post(`/applications/${applicationId}/hire`, {}, { headers });
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new BackendRequestError(
          this.extractBackendMessage(error.response?.data) || "Unable to hire this applicant.",
          error.response?.status
        );
      }

      throw error;
    }
  }

  async rejectApplicant(applicationId: string | number, token?: string): Promise<void> {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      await this.client.post(`/applications/${applicationId}/reject`, {}, { headers });
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new BackendRequestError(
          this.extractBackendMessage(error.response?.data) || "Unable to reject this applicant.",
          error.response?.status
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
