import express from "express";
import nunjucks from "nunjucks";
import path from "path";
import multer from "multer";
import { authController } from "./controllers/authController";
import { jobRoleController } from "./controllers/jobRoleController";
import { applicationController } from "./controllers/applicationController";
import "dotenv/config";
import session from "express-session";
import { requireAuth } from "./middleware/requireAuth";

export const app = express();
const viewsPath = path.join(__dirname, "views");
const publicPath = path.join(__dirname, "public");
const cvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

nunjucks.configure(viewsPath, {
  autoescape: true,
  express: app,
  noCache: process.env.NODE_ENV !== "production"
});
secret: process.env.SESSION_SECRET as string,
app.use(express.static(publicPath));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 1000
    }
  })
);

app.use((req, res, next) => {
  res.locals.isAuthenticated = Boolean(req.session.token);
  res.locals.isAdmin = req.session.user?.role === "admin";
  next();
});

const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.session.user?.role !== "admin") {
    res.redirect("/login");
    return;
  }
  next();
};

app.get("/", (_req, res) => {
  res.render("home.html");
});

app.get("/login", authController.showLogin.bind(authController));
app.post("/login", authController.login.bind(authController));
app.get("/register", authController.showRegister.bind(authController));
app.post("/register", authController.register.bind(authController));
app.post("/logout", authController.logout.bind(authController));

app.get("/job-roles", jobRoleController.list);
app.get("/job-roles/add", requireAdmin, jobRoleController.showAddForm.bind(jobRoleController));
app.post("/job-roles/add", requireAdmin, jobRoleController.createRole.bind(jobRoleController));
app.get(
  "/job-roles/:id/edit",
  requireAdmin,
  jobRoleController.showEditForm.bind(jobRoleController)
);
app.post("/job-roles/:id/edit", requireAdmin, jobRoleController.updateRole.bind(jobRoleController));
app.post(
  "/job-roles/:id/delete",
  requireAdmin,
  jobRoleController.deleteRole.bind(jobRoleController)
);
app.get(
  "/job-roles/:id/apply",
  requireAuth,
  applicationController.showApplyForm.bind(applicationController)
);
app.post(
  "/job-roles/:id/apply",
  requireAuth,
  cvUpload.single("cv"),
  applicationController.submitApplication.bind(applicationController)
);
app.get(
  "/job-roles/:id/apply/confirmation",
  requireAuth,
  applicationController.showConfirmation.bind(applicationController)
);
app.get(
  "/applications",
  requireAuth,
  applicationController.listMyApplications.bind(applicationController)
);
app.get("/job-roles/:id", jobRoleController.getById);

app.get("/health", (_req, res) => {
  res.json({
    status: "UP",
    time: new Date().toISOString()
  });
});
