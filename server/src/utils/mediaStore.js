import { readFile, unlink } from "node:fs/promises";
import StoredFile from "../models/StoredFile.js";

function hasCloudinaryConfig() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

async function uploadToCloudinary(file) {
  if (!file || !hasCloudinaryConfig()) return "";

  const { v2: cloudinary } = await import("cloudinary");
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });

  const result = await cloudinary.uploader.upload(file.path, {
    folder: process.env.CLOUDINARY_FOLDER || "hirko-portfolio",
    resource_type: "auto",
    use_filename: true,
    unique_filename: true
  });

  await unlink(file.path).catch(() => {});
  return result.secure_url || result.url || "";
}

export async function saveUploadedFile(file) {
  if (!file) return "";

  const cloudinaryUrl = await uploadToCloudinary(file);
  if (cloudinaryUrl) return cloudinaryUrl;

  const data = await readFile(file.path);
  const storedFile = await StoredFile.create({
    filename: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    data
  });

  await unlink(file.path).catch(() => {});
  return `/api/media/${storedFile._id}`;
}

export async function saveUploadedDiskFile(file) {
  if (!file) return "";
  const cloudinaryUrl = await uploadToCloudinary(file);
  if (cloudinaryUrl) return cloudinaryUrl;
  return `/uploads/${file.filename}`;
}
