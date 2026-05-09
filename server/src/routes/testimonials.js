import express from "express";
import Testimonial from "../models/Testimonial.js";
import { requireAdmin } from "../middleware/auth.js";
import { fileUpload } from "../middleware/fileUpload.js";
import { saveUploadedFile } from "../utils/mediaStore.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const query = req.query.all === "true" ? {} : { public: true };
    const testimonials = await Testimonial.find(query).sort({ sortOrder: 1, createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAdmin, fileUpload.single("file"), async (req, res, next) => {
  try {
    const isImage = req.file?.mimetype?.startsWith("image/");
    const fileUrl = req.file ? await saveUploadedFile(req.file) : "";
    const testimonial = await Testimonial.create({
      name: req.body.name,
      role: req.body.role || "",
      quote: req.body.quote,
      type: req.body.type || "testimonial",
      imageUrl: isImage ? fileUrl : "",
      fileUrl: req.file && !isImage ? fileUrl : "",
      public: req.body.public !== "false",
      sortOrder: Number(req.body.sortOrder || 0)
    });

    res.status(201).json(testimonial);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireAdmin, fileUpload.single("file"), async (req, res, next) => {
  try {
    const existing = await Testimonial.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Item not found." });
    }

    const isImage = req.file?.mimetype?.startsWith("image/");
    const fileUrl = req.file ? await saveUploadedFile(req.file) : "";
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        role: req.body.role || "",
        quote: req.body.quote,
        type: req.body.type || "testimonial",
        imageUrl: req.file && isImage ? fileUrl : existing.imageUrl,
        fileUrl: req.file && !isImage ? fileUrl : existing.fileUrl,
        public: req.body.public === true || req.body.public === "true",
        sortOrder: Number(req.body.sortOrder || 0)
      },
      { new: true, runValidators: true }
    );

    res.json(testimonial);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: "Item not found." });
    }

    res.json({ message: "Item deleted." });
  } catch (error) {
    next(error);
  }
});

export default router;
