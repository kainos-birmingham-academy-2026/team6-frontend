import axios, { AxiosInstance } from "axios";

export class ChatService {
  private readonly client: AxiosInstance;

  constructor(
    private readonly apiBaseUrl: string = process.env.API_BASE_URL || "http://localhost:3000"
  ) {
    this.client = axios.create({
      baseURL: this.apiBaseUrl,
      timeout: 20000
    });
  }

  async askQuestion(question: string): Promise<string> {
    const response = await this.client.post<{ answer: string }>(
      "/chat",
      { question },
      { headers: { "Content-Type": "application/json" } }
    );

    return response.data.answer;
  }
}

export const chatService = new ChatService();
