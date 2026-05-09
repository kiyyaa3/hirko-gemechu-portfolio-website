import express from "express";
import Message from "../models/Message.js";
import { requireAdmin } from "../middleware/auth.js";
import { sendContactNotification } from "../services/email.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "Name, email, subject, and message are required." });
    }

    const contactMessage = await Message.create({ name, email, phone, subject, message });
    let emailStatus = { sent: false };

    try {
      emailStatus = await sendContactNotification(contactMessage);
    } catch (error) {
      console.error("Email notification failed:", error.message);
      emailStatus = { sent: false, error: error.message };
    }

    res.status(201).json({
      message: emailStatus.sent
        ? "Contact request received and email notification sent."
        : "Contact request received, but email notification was not sent. Check SMTP settings.",
      id: contactMessage._id,
      emailSent: Boolean(emailStatus.sent)
    });
  } catch (error) {
    next(error);
  }
});

router.get("/", requireAdmin, async (_req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", requireAdmin, async (req, res, next) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    res.json(message);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    res.json({ message: "Message deleted." });
  } catch (error) {
    next(error);
  }
});

export default router;
