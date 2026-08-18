import { app } from "./server";

const port = Number(process.env.PORT) || 3001;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
