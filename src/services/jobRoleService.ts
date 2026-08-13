import axios, { AxiosError, type AxiosInstance } from "axios";

export type BackendJobRole = {
  jobRoleId?: number | string;
  roleName?: string;
  description?: string;
  responsibilities?: string;
  sharepointUrl?: string;
  location?: string;
  capabilityName?: string;
  capabilityId?: number | string;
  bandName?: string;
  bandId?: number | string;
  closingDate?: string;
  status?: string;
  statusName?: string;
  numberOfOpenPositions?: number;
};

export type BackendCapability = {
  capabilityId: number;
  capabilityName: string;
};

export type BackendBand = {
  bandId: number;
  bandName: string;
};

export type JobRolePayload = {
  roleName: string;
  location: string;
  capabilityId: number;
  bandId: number;
  closingDate: string;
  description?: string;
  responsibilities?: string;
  sharepointUrl?: string;
  numberOfOpenPositions?: number;
};

type ErrorPayload = {
  error?: string;
  details?: Array<{ message?: string }>;
};

export class JobRoleService {
  private readonly client: AxiosInstance;

  constructor(
    private readonly apiBaseUrl: string = process.env.API_BASE_URL || "http://localhost:3000"
  ) {
    this.client = axios.create({
      baseURL: this.apiBaseUrl,
      timeout: 5000
    });
  }

  async getOpenJobRoles(): Promise<BackendJobRole[]> {
    try {
      const response = await this.client.get<BackendJobRole[]>("/job-roles");

      // Render backend data as-is so roles without a status field are still shown.
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to fetch job roles: ${error.response?.status ?? "unknown"}`);
      }

      throw error;
    }
  }

  async getJobRoleById(jobRoleId: string | number): Promise<BackendJobRole> {
    try {
      const response = await this.client.get<BackendJobRole>(`/job-roles/${jobRoleId}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to fetch job role: ${error.response?.status ?? "unknown"}`);
      }

      throw error;
    }
  }

  async getCapabilities(): Promise<BackendCapability[]> {
    try {
      const response = await this.client.get<BackendCapability[]>("/capabilities");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to fetch capabilities: ${error.response?.status ?? "unknown"}`);
      }

      throw error;
    }
  }

  async getBands(): Promise<BackendBand[]> {
    try {
      const response = await this.client.get<BackendBand[]>("/bands");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to fetch bands: ${error.response?.status ?? "unknown"}`);
      }

      throw error;
    }
  }

  async createJobRole(payload: JobRolePayload): Promise<BackendJobRole> {
    try {
      const response = await this.client.post<BackendJobRole>("/job-roles", payload);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          this.extractBackendMessage(error.response?.data) || "Unable to create job role."
        );
      }

      throw error;
    }
  }

  async updateJobRole(
    jobRoleId: string | number,
    payload: JobRolePayload
  ): Promise<BackendJobRole> {
    try {
      const response = await this.client.put<BackendJobRole>(`/job-roles/${jobRoleId}`, payload);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          this.extractBackendMessage(error.response?.data) || "Unable to update job role."
        );
      }

      throw error;
    }
  }

  async deleteJobRole(jobRoleId: string | number): Promise<void> {
    try {
      await this.client.delete(`/job-roles/${jobRoleId}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          this.extractBackendMessage(error.response?.data) || "Unable to delete job role."
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
    if (Array.isArray(payload.details) && payload.details.length > 0) {
      const firstDetail = payload.details.find((detail) => typeof detail.message === "string");
      if (firstDetail?.message) {
        return firstDetail.message;
      }
    }

    return payload.error || null;
  }
}

export const jobRoleService = new JobRoleService();
