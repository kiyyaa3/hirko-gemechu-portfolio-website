import { readFile, unlink } from "node:fs/promises";
import StoredFile from "../models/StoredFile.js";

export async function saveUploadedFile(file) {
  if (!file) return "";

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
