import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: "Invalid admin credentials." });
    }

    const validPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid admin credentials." });
    }

    const token = jwt.sign(
      { id: admin._id.toString(), email: admin.email, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      token,
      admin: {
        name: admin.name,
        email: admin.email
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", requireAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

router.put("/password", requireAdmin, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters." });
    }

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const validPassword = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    admin.passwordHash = await bcrypt.hash(newPassword, 12);
    await admin.save();

    res.json({ message: "Password changed successfully." });
  } catch (error) {
    next(error);
  }
});

export default router;
