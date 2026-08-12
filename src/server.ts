import express from "express";
import nunjucks from "nunjucks";
import path from "path";
import { authController } from "./controllers/authController";
import { jobRoleController } from "./controllers/jobRoleController";
import "dotenv/config";
import session from "express-session";

export const app = express();
const port = Number(process.env.PORT) || 3001;
const viewsPath = path.join(__dirname, "views");
const publicPath = path.join(__dirname, "public");

nunjucks.configure(viewsPath, {
  autoescape: true,
  express: app
});

app.use(express.static(publicPath));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave:false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 1000,
    }
  })
)

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
app.get("/job-roles/:id/edit", requireAdmin, jobRoleController.showEditForm.bind(jobRoleController));
app.post("/job-roles/:id/edit", requireAdmin, jobRoleController.updateRole.bind(jobRoleController));
app.post("/job-roles/:id/delete", requireAdmin, jobRoleController.deleteRole.bind(jobRoleController));
app.get("/job-roles/:id", jobRoleController.getById);

app.get("/health", (_req, res) => {
  res.json({
    status: "UP",
    time: new Date().toISOString()
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}
