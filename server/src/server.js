import "./config.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import contentRoutes from "./routes/content.js";
import assetRoutes from "./routes/assets.js";
import messageRoutes from "./routes/messages.js";
import postRoutes from "./routes/posts.js";
import testimonialRoutes from "./routes/testimonials.js";
import { connectDb } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS."));
  },
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 1000),
  skip: (req) => req.path === "/api/health"
}));

app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));
app.use("/starter", express.static(path.resolve(__dirname, "../../client/public/starter")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "hirko-portfolio-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/testimonials", testimonialRoutes);

if (process.env.NODE_ENV === "production" && process.env.SERVE_CLIENT !== "false") {
  const clientDist = path.resolve(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use((error, _req, res, _next) => {
  console.error(error);
  const message = error.message || "Something went wrong.";
  res.status(error.status || 500).json({ message });
});

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`API running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server");
    console.error(error);
    process.exit(1);
  });
