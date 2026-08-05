import axios, { AxiosError, type AxiosInstance } from "axios";

export type BackendJobRole = {
  jobRoleId?: number | string;
  roleName?: string;
  location?: string;
  capabilityName?: string;
  capabilityId?: number | string;
  bandName?: string;
  bandId?: number | string;
  closingDate?: string;
  status?: string;
};

export class JobRoleService {
  private readonly client: AxiosInstance;

  constructor(private readonly apiBaseUrl: string = process.env.API_BASE_URL || "http://localhost:3000") {
    this.client = axios.create({
      baseURL: this.apiBaseUrl,
      timeout: 5000
    });
  }

  async getOpenJobRoles(): Promise<BackendJobRole[]> {
    try {
      const response = await this.client.get<BackendJobRole[]>("/job-roles");

      return response.data.filter((role) => (role.status ?? "").toLowerCase() === "open");
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to fetch job roles: ${error.response?.status ?? "unknown"}`);
      }

      throw error;
    }
  }
}

export const jobRoleService = new JobRoleService();