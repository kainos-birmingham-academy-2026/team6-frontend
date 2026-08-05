import type { Request, Response } from "express";
import { jobRoleService } from "../services/jobRoleService";

export class JobRoleController {
  async list(_req: Request, res: Response): Promise<void> {
    try {
      const jobRoles = await jobRoleService.getOpenJobRoles();

      res.render("job-role-list.html", {
        jobRoles,
        hasLoadError: false
      });
    } catch {
      res.status(502).render("job-role-list.html", {
        jobRoles: [],
        hasLoadError: true
      });
    }
  }

  async index(req: Request, res: Response): Promise<void> {
    await this.list(req, res);
  }
}

export const jobRoleController = new JobRoleController();