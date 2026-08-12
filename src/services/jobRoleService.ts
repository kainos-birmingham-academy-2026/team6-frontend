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

// Thrown for failed backend requests; carries the HTTP status so callers can
// distinguish auth failures (401/403) from other errors.
export class BackendRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "BackendRequestError";
  }
}

export class JobRoleService {
  private readonly client: AxiosInstance;

  constructor(private readonly apiBaseUrl: string = process.env.API_BASE_URL || "http://localhost:3000") {
    this.client = axios.create({
      baseURL: this.apiBaseUrl,
      timeout: 5000
    });
  }

  async getOpenJobRoles(token?: string): Promise<BackendJobRole[]> {
    try {
      const response = await this.client.get<BackendJobRole[]>("/job-roles", {
        headers: this.buildAuthHeaders(token)
      });

      // Render backend data as-is so roles without a status field are still shown.
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new BackendRequestError(
          `Failed to fetch job roles: ${error.response?.status ?? "unknown"}`,
          error.response?.status
        );
      }

      throw error;
    }
  }

  async getJobRoleById(jobRoleId: string | number, token?: string): Promise<BackendJobRole> {
    try {
      const response = await this.client.get<BackendJobRole>(`/job-roles/${jobRoleId}`, {
        headers: this.buildAuthHeaders(token)
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new BackendRequestError(
          `Failed to fetch job role: ${error.response?.status ?? "unknown"}`,
          error.response?.status
        );
      }

      throw error;
    }
  }

  private buildAuthHeaders(token?: string): Record<string, string> | undefined {
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }
}

export const jobRoleService = new JobRoleService();