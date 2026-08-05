import express from "express";
import nunjucks from "nunjucks";
import path from "path";

export const app = express();
const port = Number(process.env.PORT) || 3000;
const viewsPath = path.join(__dirname, "views");

nunjucks.configure(viewsPath, {
  autoescape: true,
  express: app
});

app.get("/", (_req, res) => {
  res.render("index.njk");
});

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
