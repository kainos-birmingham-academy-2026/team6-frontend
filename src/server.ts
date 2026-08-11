import express from "express";
import nunjucks from "nunjucks";
import path from "path";
import { authController } from "./controllers/authController";
import { jobRoleController } from "./controllers/jobRoleController";

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

app.get("/", (_req, res) => {
  res.render("home.html");
});

app.get("/login", authController.showLogin.bind(authController));
app.post("/login", authController.login.bind(authController));
app.get("/register", authController.showRegister.bind(authController));
app.post("/register", authController.register.bind(authController));

app.get("/job-roles", jobRoleController.list);
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
