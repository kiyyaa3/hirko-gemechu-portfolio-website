import express from "express";
import StoredFile from "../models/StoredFile.js";

const router = express.Router();

router.get("/:id", async (req, res, next) => {
  try {
    const file = await StoredFile.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Length", file.size);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Content-Disposition", `inline; filename="${file.originalName.replace(/"/g, "")}"`);
    return res.send(file.data);
  } catch (error) {
    return next(error);
  }
});

export default router;
