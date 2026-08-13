import type { Request, Response } from "express";
import {
  BackendRequestError,
  jobRoleService,
  type JobRolePayload
} from "../services/jobRoleService";

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

const formatDateForInput = (value?: string): string => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
};

type JobRoleFormValues = {
  roleName: string;
  location: string;
  capabilityId: string;
  bandId: string;
  closingDate: string;
  description: string;
  responsibilities: string;
  sharepointUrl: string;
  numberOfOpenPositions: string;
};

const emptyFormValues: JobRoleFormValues = {
  roleName: "",
  location: "",
  capabilityId: "",
  bandId: "",
  closingDate: "",
  description: "",
  responsibilities: "",
  sharepointUrl: "",
  numberOfOpenPositions: ""
};

const toFormValues = (body: Record<string, unknown>): JobRoleFormValues => ({
  roleName: typeof body.roleName === "string" ? body.roleName : "",
  location: typeof body.location === "string" ? body.location : "",
  capabilityId: typeof body.capabilityId === "string" ? body.capabilityId : "",
  bandId: typeof body.bandId === "string" ? body.bandId : "",
  closingDate: typeof body.closingDate === "string" ? body.closingDate : "",
  description: typeof body.description === "string" ? body.description : "",
  responsibilities: typeof body.responsibilities === "string" ? body.responsibilities : "",
  sharepointUrl: typeof body.sharepointUrl === "string" ? body.sharepointUrl : "",
  numberOfOpenPositions:
    typeof body.numberOfOpenPositions === "string" ? body.numberOfOpenPositions : ""
});

const validateFormValues = (values: JobRoleFormValues): string | null => {
  if (!values.roleName.trim()) {
    return "Role name is required.";
  }
  if (!values.location.trim()) {
    return "Location is required.";
  }
  if (!values.capabilityId) {
    return "Please select a capability.";
  }
  if (!values.bandId) {
    return "Please select a band.";
  }
  if (!values.closingDate || Number.isNaN(new Date(values.closingDate).getTime())) {
    return "A valid closing date is required.";
  }
  if (values.numberOfOpenPositions && Number.isNaN(Number(values.numberOfOpenPositions))) {
    return "Number of open positions must be a number.";
  }
  return null;
};

const toPayload = (values: JobRoleFormValues): JobRolePayload => ({
  roleName: values.roleName.trim(),
  location: values.location.trim(),
  capabilityId: Number(values.capabilityId),
  bandId: Number(values.bandId),
  closingDate: values.closingDate,
  description: values.description.trim() || undefined,
  responsibilities: values.responsibilities.trim() || undefined,
  sharepointUrl: values.sharepointUrl.trim() || undefined,
  numberOfOpenPositions: values.numberOfOpenPositions
    ? Number(values.numberOfOpenPositions)
    : undefined
});

export class JobRoleController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const jobRoles = await jobRoleService.getOpenJobRoles(req.session.token);
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
    } catch (error) {
      if (await redirectToLoginOnAuthFailure(error, req, res)) {
        return;
      }

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

      const role = await jobRoleService.getJobRoleById(id, req.session.token);
      const jobRoleViewModel = {
        ...role,
        capabilityDisplay: role.capabilityName || role.capabilityId || "N/A",
        bandDisplay: role.bandName || role.bandId || "N/A",
        closingDateDisplay: formatDateToDayMonthYear(role.closingDate),
        statusDisplay: role.statusName || role.status || "N/A",
        openPositionsDisplay:
          typeof role.numberOfOpenPositions === "number"
            ? String(role.numberOfOpenPositions)
            : "N/A",
        responsibilitiesDisplay: role.responsibilities || "No responsibilities provided.",
        sharepointUrlDisplay: role.sharepointUrl || ""
      };

      res.render("job-role-information.html", {
        jobRole: jobRoleViewModel,
        hasLoadError: false,
        hasNotFoundError: false
      });
    } catch (error) {
      if (await redirectToLoginOnAuthFailure(error, req, res)) {
        return;
      }

      res.status(502).render("job-role-information.html", {
        jobRole: null,
        hasLoadError: true,
        hasNotFoundError: false
      });
    }
  }

  async showAddForm(_req: Request, res: Response): Promise<void> {
    try {
      const [capabilities, bands] = await Promise.all([
        jobRoleService.getCapabilities(),
        jobRoleService.getBands()
      ]);

      res.render("job-role-form.html", {
        formMode: "add",
        formAction: "/job-roles/add",
        formTitle: "Add Job Role",
        values: emptyFormValues,
        capabilities,
        bands,
        errorMessage: ""
      });
    } catch {
      res.status(502).render("job-role-form.html", {
        formMode: "add",
        formAction: "/job-roles/add",
        formTitle: "Add Job Role",
        values: emptyFormValues,
        capabilities: [],
        bands: [],
        errorMessage: "Unable to load capabilities and bands right now. Please try again shortly."
      });
    }
  }

  async createRole(req: Request, res: Response): Promise<void> {
    const values = toFormValues(req.body ?? {});
    const validationError = validateFormValues(values);
    const [capabilities, bands] = await Promise.all([
      jobRoleService.getCapabilities(),
      jobRoleService.getBands()
    ]);

    if (validationError) {
      res.status(400).render("job-role-form.html", {
        formMode: "add",
        formAction: "/job-roles/add",
        formTitle: "Add Job Role",
        values,
        capabilities,
        bands,
        errorMessage: validationError
      });
      return;
    }

    try {
      await jobRoleService.createJobRole(toPayload(values), req.session.token);
      res.redirect("/job-roles");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to create job role right now.";
      res.status(400).render("job-role-form.html", {
        formMode: "add",
        formAction: "/job-roles/add",
        formTitle: "Add Job Role",
        values,
        capabilities,
        bands,
        errorMessage
      });
    }
  }

  async showEditForm(req: Request, res: Response): Promise<void> {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    try {
      const [role, capabilities, bands] = await Promise.all([
        jobRoleService.getJobRoleById(id, req.session.token),
        jobRoleService.getCapabilities(),
        jobRoleService.getBands()
      ]);

      const values: JobRoleFormValues = {
        roleName: role.roleName || "",
        location: role.location || "",
        capabilityId: role.capabilityId ? String(role.capabilityId) : "",
        bandId: role.bandId ? String(role.bandId) : "",
        closingDate: formatDateForInput(role.closingDate),
        description: role.description || "",
        responsibilities: role.responsibilities || "",
        sharepointUrl: role.sharepointUrl || "",
        numberOfOpenPositions:
          typeof role.numberOfOpenPositions === "number" ? String(role.numberOfOpenPositions) : ""
      };

      res.render("job-role-form.html", {
        formMode: "edit",
        formAction: `/job-roles/${id}/edit`,
        formTitle: "Edit Job Role",
        values,
        capabilities,
        bands,
        errorMessage: ""
      });
    } catch {
      res.status(502).render("job-role-form.html", {
        formMode: "edit",
        formAction: `/job-roles/${id}/edit`,
        formTitle: "Edit Job Role",
        values: emptyFormValues,
        capabilities: [],
        bands: [],
        errorMessage: "Unable to load this job role right now. Please try again shortly."
      });
    }
  }

  async updateRole(req: Request, res: Response): Promise<void> {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const values = toFormValues(req.body ?? {});
    const validationError = validateFormValues(values);
    const [capabilities, bands] = await Promise.all([
      jobRoleService.getCapabilities(),
      jobRoleService.getBands()
    ]);

    if (validationError) {
      res.status(400).render("job-role-form.html", {
        formMode: "edit",
        formAction: `/job-roles/${id}/edit`,
        formTitle: "Edit Job Role",
        values,
        capabilities,
        bands,
        errorMessage: validationError
      });
      return;
    }

    try {
      await jobRoleService.updateJobRole(id, toPayload(values), req.session.token);
      res.redirect(`/job-roles/${id}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to update job role right now.";
      res.status(400).render("job-role-form.html", {
        formMode: "edit",
        formAction: `/job-roles/${id}/edit`,
        formTitle: "Edit Job Role",
        values,
        capabilities,
        bands,
        errorMessage
      });
    }
  }

  async deleteRole(req: Request, res: Response): Promise<void> {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    try {
      await jobRoleService.deleteJobRole(id, req.session.token);
    } catch {
      // Fall through to redirect back to the job roles list even if the delete failed,
      // where the role will still be visible if it was not actually removed.
    }

    res.redirect("/job-roles");
  }
}

export const jobRoleController = new JobRoleController();
