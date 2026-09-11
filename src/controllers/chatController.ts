import { Request, Response } from "express";
import { chatService } from "../services/chatService";

const MIN_QUESTION_LENGTH = 3;
const MAX_QUESTION_LENGTH = 500;

export class ChatController {
  async ask(req: Request, res: Response): Promise<void> {
    const raw = typeof req.body?.question === "string" ? req.body.question.trim() : "";

    if (raw.length < MIN_QUESTION_LENGTH || raw.length > MAX_QUESTION_LENGTH) {
      res.status(400).json({
        error: `Please enter a question between ${MIN_QUESTION_LENGTH} and ${MAX_QUESTION_LENGTH} characters.`
      });
      return;
    }

    try {
      const answer = await chatService.askQuestion(raw);
      res.status(200).json({ answer });
    } catch {
      res.status(503).json({
        error: "Sorry, the assistant is unavailable right now. Please try again."
      });
    }
  }
}

export const chatController = new ChatController();
