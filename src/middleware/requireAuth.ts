import type { NextFunction, Request, Response } from "express";

// Redirects non-logged-in users to the login page.
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.token) {
    res.redirect("/login");
    return;
  }

  next();
}
