import axios, { AxiosError, type AxiosInstance } from "axios";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
};

export type AuthSuccessResponse = {
  token: string;
  user: {
    userid: number;
    email: string;
    role: string;
  };
};

type BackendAuthResponse = {
  token?: string;
  accessToken?: string;
  jwt?: string;
  user?: {
    userid?: number;
    id?: number;
    email?: string;
    role?: string;
  };
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
      headers: {"Content-Type": "application/json",},
      timeout: 5000,
    });
  }

  async login(payload: LoginPayload): Promise<AuthSuccessResponse> {
    try {
      const response = await this.client.post("auth/login", payload);
      return this.normalizeAuthResponse(response.data, payload.email);
    } catch (error) {
      if (error instanceof AxiosError) {
        const backendMessage = this.extractBackendMessage(error.response?.data);
        throw new Error(backendMessage || "Unable to sign in. Please check your email and password.");
      }

      throw error;
    }
  }

  async register(payload: RegisterPayload): Promise<AuthSuccessResponse> {
    try {
      const response = await this.client.post("/auth/register", payload);
      return this.normalizeAuthResponse(response.data, payload.email);
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

  private normalizeAuthResponse(data: unknown, fallbackEmail: string): AuthSuccessResponse {
    const payload = (data ?? {}) as BackendAuthResponse;
    const token = payload.token || payload.accessToken || payload.jwt;

    if (!token) {
      throw new Error("Login succeeded but no token was returned by the backend.");
    }

    return {
      token,
      user: {
        userid: payload.user?.userid ?? payload.user?.id ?? 0,
        email: payload.user?.email || fallbackEmail,
        role: payload.user?.role || "candidate"
      }
    };
  }
}

export const authService = new AuthService();
