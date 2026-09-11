import type { Request, Response } from "express";
import { authService } from "../services/authService";

declare module "express-session" {
  interface SessionData {
    user?: {
      userid: number;
      email: string;
      role: string;
    };
    token?: string;
  }
}

export class AuthController {
  private async startSession(
    req: Request,
    result: { token: string; user: { userid: number; email: string; role: string } }
  ): Promise<void> {
    req.session.user = {
      userid: result.user.userid,
      email: result.user.email,
      role: result.user.role
    };

    req.session.token = result.token;

    await new Promise<void>((resolve, reject) => {
      req.session.save((sessionError) => {
        if (sessionError) {
          reject(sessionError);
          return;
        }

        resolve();
      });
    });
  }

  showLogin(req: Request, res: Response): void {
    if (req.session.token) {
      res.redirect("/job-roles");
      return;
    }

    res.render("login.html", {
      loginEmail: "",
      loginErrorMessage: ""
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    try {
      const result = await authService.login({
        email,
        password
      });

      await this.startSession(req, result);

      res.redirect("/job-roles");
    } catch (error) {
      const loginErrorMessage =
        error instanceof Error ? error.message : "Unable to sign in right now.";

      res.status(401).render("login.html", {
        loginEmail: email,
        loginErrorMessage
      });
    }
  }

  showRegister(req: Request, res: Response): void {
    if (req.session.token) {
      res.redirect("/job-roles");
      return;
    }

    res.render("register.html", {
      registerEmail: "",
      registerErrorMessage: "",
      registerMessageClass: "auth-message-error"
    });
  }

  async register(req: Request, res: Response): Promise<void> {
    const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    try {
      const result = await authService.register({ email, password });

      await this.startSession(req, result);

      res.redirect("/");
    } catch (error) {
      const registerErrorMessage =
        error instanceof Error ? error.message : "Unable to create account right now.";

      res.status(401).render("register.html", {
        registerEmail: email,
        registerErrorMessage,
        registerMessageClass: "auth-message-error"
      });
    }
  }

  logout(req: Request, res: Response): void {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect("/login");
    });
  }
}

export const authController = new AuthController();
