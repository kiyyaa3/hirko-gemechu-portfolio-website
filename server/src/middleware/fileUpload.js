import multer from "multer";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "../../uploads");

mkdirSync(uploadDir, { recursive: true });

const allowedTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]);

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const safeName = file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/-+/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  }
});

function allowedFile(_req, file, cb) {
  if (!allowedTypes.has(file.mimetype)) {
    return cb(new Error("This file type is not allowed."));
  }

  return cb(null, true);
}

export const fileUpload = multer({
  storage,
  fileFilter: allowedFile,
  limits: {
    fileSize: 15 * 1024 * 1024
  }
});
