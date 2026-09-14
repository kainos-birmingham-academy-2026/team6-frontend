import type { Request, Response } from "express";
import { BackendRequestError, jobRoleService } from "../services/jobRoleService";
import { applicationService } from "../services/applicationService";

const ALLOWED_CV_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

const formatDateToDayMonthYear = (value?: string): string => {
  if (!value) {
    return "N/A";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const day = String(parsed.getUTCDate()).padStart(2, "0");
  const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const year = String(parsed.getUTCFullYear()).slice(-2);

  return `${day}/${month}/${year}`;
};

// Maps backend status names to a display label and a CSS class for the status pill.
const APPLICATION_STATUS_STYLES: Record<string, { label: string; className: string }> = {
  "in progress": { label: "In Progress", className: "status-pill-progress" },
  hired: { label: "Hired", className: "status-pill-success" },
  rejected: { label: "Rejected", className: "status-pill-danger" }
};

const applicationStatusDisplay = (statusName: string): { label: string; className: string } =>
  APPLICATION_STATUS_STYLES[statusName.toLowerCase()] || {
    label: statusName,
    className: "status-pill-progress"
  };

// Stable per-capability accent so a capability always keeps the same card colour.
const capabilityAccent = (name: string): number => {
  let hash = 0;
  for (const character of name) {
    hash = (hash * 31 + character.charCodeAt(0)) % 5;
  }
  return hash + 1;
};

const redirectToLoginOnAuthFailure = async (
  error: unknown,
  req: Request,
  res: Response
): Promise<boolean> => {
  if (error instanceof BackendRequestError && error.statusCode === 401) {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect("/login");
    });
    return true;
  }
  return false;
};

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

      const myApplications = await applicationService.getMyApplications(req.session.token);
      const alreadyApplied = myApplications.some(
        (application) => String(application.jobRoleId) === String(id)
      );

      if (alreadyApplied) {
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
      if (await redirectToLoginOnAuthFailure(error, req, res)) {
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : "Unable to submit your application right now.";
      const statusCode = error instanceof BackendRequestError ? error.statusCode : undefined;

      res.status(statusCode === 409 ? 409 : 502).render("job-application-form.html", {
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

  async listMyApplications(req: Request, res: Response): Promise<void> {
    try {
      const applications = await applicationService.getMyApplications(req.session.token);

      const applicationsViewModel = applications.map((application) => {
        const status = applicationStatusDisplay(application.applicationStatusName);

        return {
          ...application,
          closingDateDisplay: formatDateToDayMonthYear(application.closingDate),
          statusLabel: status.label,
          statusClass: status.className,
          accentClass: `cap-accent-${capabilityAccent(application.capabilityName)}`
        };
      });

      res.render("my-applications.html", {
        applications: applicationsViewModel,
        hasLoadError: false
      });
    } catch (error) {
      if (await redirectToLoginOnAuthFailure(error, req, res)) {
        return;
      }

      res.status(502).render("my-applications.html", {
        applications: [],
        hasLoadError: true
      });
    }
  }
}

export const applicationController = new ApplicationController();
