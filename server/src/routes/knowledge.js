import express from "express";
import KnowledgeEntry from "../models/KnowledgeEntry.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

function cleanList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeBody(body = {}) {
  return {
    question: String(body.question || "").trim(),
    answer: String(body.answer || "").trim(),
    category: String(body.category || "General").trim(),
    sourceUrl: String(body.sourceUrl || "").trim(),
    aliases: cleanList(body.aliases),
    public: body.public === true || body.public === "true",
    sortOrder: Number(body.sortOrder || 0)
  };
}

router.get("/", async (req, res, next) => {
  try {
    const query = req.query.all === "true" ? {} : { public: true };
    const entries = await KnowledgeEntry.find(query).sort({ sortOrder: 1, createdAt: -1 });
    res.json(entries);
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAdmin, async (req, res, next) => {
  try {
    const body = normalizeBody(req.body);
    if (!body.question || !body.answer) {
      return res.status(400).json({ message: "Question and answer are required." });
    }

    const entry = await KnowledgeEntry.create(body);
    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireAdmin, async (req, res, next) => {
  try {
    const body = normalizeBody(req.body);
    if (!body.question || !body.answer) {
      return res.status(400).json({ message: "Question and answer are required." });
    }

    const entry = await KnowledgeEntry.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!entry) {
      return res.status(404).json({ message: "Knowledge entry not found." });
    }

    res.json(entry);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const entry = await KnowledgeEntry.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: "Knowledge entry not found." });
    }

    res.json({ message: "Knowledge entry deleted." });
  } catch (error) {
    next(error);
  }
});

export default router;
