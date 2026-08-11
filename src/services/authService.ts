import axios, { AxiosError, type AxiosInstance } from "axios";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
};

type ErrorPayload = {
  message?: string;
  error?: string;
  errors?: string[];
};

export class AuthService {
  private readonly client: AxiosInstance;

  constructor(private readonly apiBaseUrl: string = process.env.API_BASE_URL || "http://localhost:3000") {
    this.client = axios.create({
      baseURL: this.apiBaseUrl,
      timeout: 5000
    });
  }

  async login(payload: LoginPayload): Promise<void> {
    try {
      await this.client.post("/auth/login", payload);
    } catch (error) {
      if (error instanceof AxiosError) {
        const backendMessage = this.extractBackendMessage(error.response?.data);
        throw new Error(backendMessage || "Unable to sign in. Please check your email and password.");
      }

      throw error;
    }
  }

  async register(payload: RegisterPayload): Promise<void> {
    try {
      await this.client.post("/auth/register", payload);
    } catch (error) {
      if (error instanceof AxiosError) {
        const backendMessage = this.extractBackendMessage(error.response?.data);
        throw new Error(backendMessage || "Unable to create account. Please check your details and try again.");
      }

      throw error;
    }
  }

  private extractBackendMessage(data: unknown): string | null {
    if (!data || typeof data !== "object") {
      return null;
    }

    const payload = data as ErrorPayload;

    if (typeof payload.message === "string" && payload.message.trim().length > 0) {
      return payload.message;
    }

    if (typeof payload.error === "string" && payload.error.trim().length > 0) {
      return payload.error;
    }

    if (Array.isArray(payload.errors)) {
      const firstError = payload.errors.find((entry) => typeof entry === "string" && entry.trim().length > 0);
      return firstError || null;
    }

    return null;
  }
}

export const authService = new AuthService();
