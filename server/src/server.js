import "./config.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Admin from "./models/Admin.js";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import projectRoutes from "./routes/projects.js";
import contentRoutes from "./routes/content.js";
import assetRoutes from "./routes/assets.js";
import messageRoutes from "./routes/messages.js";
import mediaRoutes from "./routes/media.js";
import postRoutes from "./routes/posts.js";
import testimonialRoutes from "./routes/testimonials.js";
import { connectDb, getDatabaseStatus, isDatabaseReady } from "./db.js";
import { getEmailConfigStatus } from "./services/email.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 5000;
const defaultOrigins = [
  "http://localhost:5173",
  "https://kiyyaa3.github.io",
  "https://kiyyaa3.github.io/hirko-gemechu-portfolio-website",
  "https://hirko-gemechu-portfolio-website.onrender.com"
];
const allowedOrigins = [
  ...defaultOrigins,
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
];

function isAllowedOrigin(origin) {
  if (!origin) return true;

  try {
    const { hostname } = new URL(origin);
    return allowedOrigins.includes(origin)
      || hostname.endsWith(".netlify.app")
      || hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
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
  res.json({
    status: "ok",
    app: "hirko-portfolio-api",
    node: process.version,
    database: getDatabaseStatus(),
    email: getEmailConfigStatus()
  });
});

app.use("/api", (req, res, next) => {
  if (req.path === "/health" || isDatabaseReady()) {
    return next();
  }

  return res.status(503).json({
    message: "Database is not connected. Check MONGO_URI in Render environment variables.",
    database: getDatabaseStatus()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/testimonials", testimonialRoutes);

const clientDist = path.resolve(__dirname, "../../client/dist");
const clientIndex = path.join(clientDist, "index.html");
const shouldServeClient = process.env.NODE_ENV === "production"
  && process.env.SERVE_CLIENT === "true"
  && existsSync(clientIndex);

if (process.env.NODE_ENV === "production" && process.env.SERVE_CLIENT === "true" && !existsSync(clientIndex)) {
  console.warn("SERVE_CLIENT=true but client/dist/index.html is missing. Running API-only mode.");
}

app.get("/", (_req, res) => {
  if (shouldServeClient) {
    return res.sendFile(clientIndex);
  }

  res.json({
    status: "ok",
    app: "hirko-portfolio-api",
    frontend: process.env.CLIENT_URL || "Deploy the frontend on Netlify.",
    health: "/api/health"
  });
});

if (shouldServeClient) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    return res.sendFile(clientIndex);
  });
}

app.use((error, _req, res, _next) => {
  console.error(error);
  const message = error.message || "Something went wrong.";
  res.status(error.status || 500).json({ message });
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});

async function ensureAdminAccount() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn("ADMIN_EMAIL or ADMIN_PASSWORD is missing. Admin account was not seeded.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await Admin.findOneAndUpdate(
    { email: email.toLowerCase() },
    { name: "Hirko Admin", email: email.toLowerCase(), passwordHash },
    { upsert: true, new: true }
  );
  console.log(`Admin ready: ${email.toLowerCase()}`);
}

connectDb().then(ensureAdminAccount).catch((error) => {
  console.error("Database connection failed");
  console.error(error);
});
