import type { Request, Response } from "express";
import { jobRoleService } from "../services/jobRoleService";

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

export class JobRoleController {
  async list(_req: Request, res: Response): Promise<void> {
    try {
      const jobRoles = await jobRoleService.getOpenJobRoles();
      const jobRolesViewModel = jobRoles.map((role, index) => ({
        ...role,
        detailsId: role.jobRoleId ?? index + 1,
        capabilityDisplay: role.capabilityName || role.capabilityId || "N/A",
        bandDisplay: role.bandName || role.bandId || "N/A",
        closingDateDisplay: formatDateToDayMonthYear(role.closingDate)
      }));

      res.render("job-role-list.html", {
        jobRoles: jobRolesViewModel,
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

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;

      if (!id) {
        res.status(400).render("job-role-information.html", {
          jobRole: null,
          hasLoadError: true,
          hasNotFoundError: false
        });
        return;
      }

      const role = await jobRoleService.getJobRoleById(id);
      const jobRoleViewModel = {
        ...role,
        capabilityDisplay: role.capabilityName || role.capabilityId || "N/A",
        bandDisplay: role.bandName || role.bandId || "N/A",
        closingDateDisplay: formatDateToDayMonthYear(role.closingDate),
        statusDisplay: role.statusName || role.status || "N/A",
        openPositionsDisplay:
          typeof role.numberOfOpenPositions === "number" ? String(role.numberOfOpenPositions) : "N/A",
        responsibilitiesDisplay: role.responsibilities || "No responsibilities provided.",
        sharepointUrlDisplay: role.sharepointUrl || ""
      };

      res.render("job-role-information.html", {
        jobRole: jobRoleViewModel,
        hasLoadError: false,
        hasNotFoundError: false
      });
    } catch {
      res.status(502).render("job-role-information.html", {
        jobRole: null,
        hasLoadError: true,
        hasNotFoundError: false
      });
    }
  }
}

export const jobRoleController = new JobRoleController();