import express from "express";
import cors from "cors";

import listRouter from "./app/routes/list.routes.js";
import loginRouter from "./app/routes/login.routes.js";

const app = express();
app.use(express.json());
app.use(cors());

// simple route
app.get("/", (_, res) => {
  res.send("Welcome to Express application.");
});

app.use("/list", listRouter);
app.use("/login", loginRouter);

app.set("port", process.env.PORT || 8082);
app.listen(app.get("port"), () => {
  console.log(`Listening on port ${app.get("port")}`);
});

export default app;

