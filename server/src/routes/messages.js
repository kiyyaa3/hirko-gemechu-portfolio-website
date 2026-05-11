import express from "express";
import Message from "../models/Message.js";
import { requireAdmin } from "../middleware/auth.js";
import { sendContactNotification } from "../services/email.js";

const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanField(value = "", maxLength = 1000) {
  return String(value || "").replace(/\s+\n/g, "\n").trim().slice(0, maxLength);
}

function publicEmailError(errorMessage = "") {
  const message = String(errorMessage);
  if (!message) return "Unknown email notification error.";
  if (message.toLowerCase().includes("invalid login") || message.includes("535")) {
    return "Gmail rejected the SMTP login. Check SMTP_USER and SMTP_PASS app password in Render.";
  }
  if (message.toLowerCase().includes("timeout") || message.includes("ETIMEDOUT")) {
    return "Render could not connect to Gmail SMTP before timeout.";
  }
  if (message.includes("ECONNREFUSED")) {
    return "Gmail SMTP connection was refused from Render.";
  }
  return message.slice(0, 240);
}

router.post("/", async (req, res, next) => {
  try {
    const name = cleanField(req.body?.name, 120);
    const email = cleanField(req.body?.email, 180).toLowerCase();
    const phone = cleanField(req.body?.phone, 60);
    const subject = cleanField(req.body?.subject, 180);
    const message = cleanField(req.body?.message, 5000);

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "Name, email, subject, and message are required." });
    }

    if (!emailPattern.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    const contactMessage = await Message.create({ name, email, phone, subject, message });
    let emailStatus = { sent: false };

    try {
      emailStatus = await sendContactNotification(contactMessage);
    } catch (error) {
      console.error("Email notification failed:", error.message);
      emailStatus = { sent: false, error: publicEmailError(error.message) };
    }

    res.status(201).json({
      message: emailStatus.sent
        ? "Contact request received and email notification sent."
        : "Contact request received, but email notification was not sent. Check SMTP settings.",
      id: contactMessage._id,
      emailSent: Boolean(emailStatus.sent),
      ...(emailStatus.provider ? { emailProvider: emailStatus.provider } : {}),
      ...(emailStatus.note ? { emailNote: emailStatus.note } : {}),
      ...(emailStatus.error ? { emailError: emailStatus.error } : {})
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
