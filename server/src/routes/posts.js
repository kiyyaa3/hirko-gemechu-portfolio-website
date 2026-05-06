import express from "express";
import Post from "../models/Post.js";
import { requireAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

function normalizeTags(tags) {
  if (typeof tags === "string") {
    return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  }
  return Array.isArray(tags) ? tags : [];
}

router.get("/", async (req, res, next) => {
  try {
    const query = req.query.all === "true" ? {} : { published: true };
    const posts = await Post.find(query).sort({ sortOrder: 1, publishedAt: -1, createdAt: -1 });
    res.json(posts);
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAdmin, upload.single("image"), async (req, res, next) => {
  try {
    const post = await Post.create({
      title: req.body.title,
      excerpt: req.body.excerpt,
      body: req.body.body,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
      tags: normalizeTags(req.body.tags),
      published: req.body.published !== "false",
      publishedAt: req.body.publishedAt || Date.now(),
      sortOrder: Number(req.body.sortOrder || 0)
    });
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireAdmin, upload.single("image"), async (req, res, next) => {
  try {
    const existing = await Post.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Post not found." });
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        excerpt: req.body.excerpt,
        body: req.body.body,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : existing.imageUrl,
        tags: normalizeTags(req.body.tags),
        published: req.body.published === true || req.body.published === "true",
        publishedAt: req.body.publishedAt || existing.publishedAt,
        sortOrder: Number(req.body.sortOrder || 0)
      },
      { new: true, runValidators: true }
    );

    res.json(post);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    res.json({ message: "Post deleted." });
  } catch (error) {
    next(error);
  }
});

export default router;
