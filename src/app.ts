import express from "express";
import cors from "cors";
import foldersRoutes from "./routes/folders.routes";
import filesRoutes from "./routes/files.routes";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:8080"],
  })
);
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

app.use("/folders", foldersRoutes);
app.use("/files", filesRoutes);

export default app;
