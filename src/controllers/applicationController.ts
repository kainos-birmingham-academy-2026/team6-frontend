import type { Request, Response } from "express";
import { BackendRequestError, jobRoleService } from "../services/jobRoleService";
import { applicationService } from "../services/applicationService";

const ALLOWED_CV_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

const isRoleOpenForApplications = (role: {
  status?: string;
  statusName?: string;
  numberOfOpenPositions?: number;
}): boolean => {
  const status = (role.statusName || role.status || "").toLowerCase();
  return status === "open" && (role.numberOfOpenPositions ?? 0) > 0;
};

export class ApplicationController {
  async showApplyForm(req: Request, res: Response): Promise<void> {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
      res.redirect("/job-roles");
      return;
    }

    try {
      const role = await jobRoleService.getJobRoleById(id, req.session.token);

      if (!isRoleOpenForApplications(role)) {
        res.redirect(`/job-roles/${id}`);
        return;
      }

      res.render("job-application-form.html", {
        jobRoleId: id,
        roleName: role.roleName || "",
        errorMessage: ""
      });
    } catch (error) {
      if (error instanceof BackendRequestError && error.statusCode === 401) {
        req.session.destroy(() => {
          res.clearCookie("connect.sid");
          res.redirect("/login");
        });
        return;
      }

      res.redirect(`/job-roles/${id}`);
    }
  }

  async submitApplication(req: Request, res: Response): Promise<void> {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
      res.redirect("/job-roles");
      return;
    }

    const file = req.file;

    if (!file) {
      res.status(400).render("job-application-form.html", {
        jobRoleId: id,
        roleName: "",
        errorMessage: "Please choose a CV file to upload."
      });
      return;
    }

    if (!ALLOWED_CV_MIME_TYPES.has(file.mimetype)) {
      res.status(400).render("job-application-form.html", {
        jobRoleId: id,
        roleName: "",
        errorMessage: "Please upload your CV as a PDF or Word document."
      });
      return;
    }

    try {
      await applicationService.submitApplication(
        {
          jobRoleId: id,
          cvFile: {
            buffer: file.buffer,
            originalName: file.originalname,
            mimeType: file.mimetype
          }
        },
        req.session.token
      );

      res.redirect(`/job-roles/${id}/apply/confirmation`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to submit your application right now.";

      res.status(502).render("job-application-form.html", {
        jobRoleId: id,
        roleName: "",
        errorMessage
      });
    }
  }

  showConfirmation(req: Request, res: Response): void {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    res.render("job-application-confirmation.html", {
      jobRoleId: id
    });
  }
}

export const applicationController = new ApplicationController();
