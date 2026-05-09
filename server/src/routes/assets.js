import express from "express";
import Asset from "../models/Asset.js";
import { requireAdmin } from "../middleware/auth.js";
import { fileUpload } from "../middleware/fileUpload.js";
import { saveUploadedFile } from "../utils/mediaStore.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const query = req.query.all === "true" ? {} : { public: true };
    const assets = await Asset.find(query).sort({ sortOrder: 1, createdAt: -1 });
    res.json(assets);
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAdmin, fileUpload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "A file is required." });
    }

    const fileUrl = await saveUploadedFile(req.file);
    const asset = await Asset.create({
      title: req.body.title,
      description: req.body.description || "",
      category: req.body.category || "Document",
      fileUrl,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      public: req.body.public !== "false",
      sortOrder: Number(req.body.sortOrder || 0)
    });

    res.status(201).json(asset);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireAdmin, async (req, res, next) => {
  try {
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description || "",
        category: req.body.category || "Document",
        public: req.body.public === true || req.body.public === "true",
        sortOrder: Number(req.body.sortOrder || 0)
      },
      { new: true, runValidators: true }
    );

    if (!asset) {
      return res.status(404).json({ message: "File not found." });
    }

    res.json(asset);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: "File not found." });
    }

    res.json({ message: "File deleted." });
  } catch (error) {
    next(error);
  }
});

export default router;
