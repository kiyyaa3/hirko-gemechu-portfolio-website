import express from "express";
import Project from "../models/Project.js";
import { requireAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

function normalizeProjectPayload(body, imageUrl = "") {
  const technologies = typeof body.technologies === "string"
    ? body.technologies.split(",").map((item) => item.trim()).filter(Boolean)
    : Array.isArray(body.technologies)
      ? body.technologies
      : [];

  return {
    title: body.title,
    category: body.category,
    description: body.description,
    imageUrl,
    liveUrl: body.liveUrl || "",
    repoUrl: body.repoUrl || "",
    technologies,
    featured: body.featured === true || body.featured === "true",
    sortOrder: Number(body.sortOrder || 0)
  };
}

router.get("/", async (_req, res, next) => {
  try {
    const projects = await Project.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAdmin, upload.single("image"), async (req, res, next) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";
    const project = await Project.create(normalizeProjectPayload(req.body, imageUrl));
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireAdmin, upload.single("image"), async (req, res, next) => {
  try {
    const existing = await Project.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Project not found." });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : existing.imageUrl;
    const payload = normalizeProjectPayload(req.body, imageUrl);
    const updated = await Project.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });

    return res.json(updated);
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Project not found." });
    }

    return res.json({ message: "Project deleted." });
  } catch (error) {
    return next(error);
  }
});

export default router;
