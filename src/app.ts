import express from "express";
import cors from "cors";
import foldersRoutes from "./routes/folders.routes";
import filesRoutes from "./routes/files.routes";

const app = express();


app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`
    );
  });
  next();
});

app.use("/folders", foldersRoutes);
app.use("/files", filesRoutes);

export default app;
