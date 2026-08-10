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
}

export const jobRoleService = new JobRoleService();