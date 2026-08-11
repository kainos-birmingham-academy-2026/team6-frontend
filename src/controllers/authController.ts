import type { Request, Response } from "express";
import { authService } from "../services/authService";

export class AuthController {
  showLogin(_req: Request, res: Response): void {
    res.render("login.html", {
      loginEmail: "",
      loginErrorMessage: ""
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    try {
      await authService.login({ email, password });
      res.redirect("/job-roles");
    } catch (error) {
      const loginErrorMessage = error instanceof Error ? error.message : "Unable to sign in right now.";

      res.status(401).render("login.html", {
        loginEmail: email,
        loginErrorMessage
      });
    }
  }

  showRegister(_req: Request, res: Response): void {
    res.render("register.html", {
      registerEmail: "",
      registerErrorMessage: ""
    });
  }

  async register(req: Request, res: Response): Promise<void> {
    const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    try {
      await authService.register({ email, password });
      res.redirect("/login");
    } catch (error) {
      const registerErrorMessage = error instanceof Error ? error.message : "Unable to create account right now.";

      res.status(401).render("register.html", {
        registerEmail: email,
        registerErrorMessage
      });
    }
  }
}

export const authController = new AuthController();
