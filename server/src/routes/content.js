import express from "express";
import SiteContent from "../models/SiteContent.js";
import { requireAdmin } from "../middleware/auth.js";
import { fileUpload } from "../middleware/fileUpload.js";
import { saveUploadedDiskFile, saveUploadedFile } from "../utils/mediaStore.js";

const router = express.Router();

async function getContentDocument() {
  let content = await SiteContent.findOne();
  if (!content) {
    content = await SiteContent.create({});
  }
  const defaults = new SiteContent();
  [
    "heroImageUrl",
    "heroVideoUrl",
    "announcementText",
    "primaryButtonLabel",
    "primaryButtonUrl",
    "secondaryButtonLabel",
    "secondaryButtonUrl",
    "availabilityText",
    "heroStats",
    "logoUrl",
    "aboutNote",
    "highlightTitle",
    "highlightBody",
    "highlightItems",
    "servicesTitle",
    "services",
    "skillsTitle",
    "skillGroups",
    "experienceTitle",
    "experienceBody",
    "publicDownloads",
    "testimonialsTitle",
    "projectsTitle",
    "downloadsTitle",
    "blogTitle",
    "contactTitle",
    "contactBody"
  ].forEach((field) => {
    if (content[field] === undefined || content[field] === null) {
      content[field] = defaults[field];
    }
  });
  return content;
}

router.get("/", async (_req, res, next) => {
  try {
    const content = await getContentDocument();
    res.json(content);
  } catch (error) {
    next(error);
  }
});

router.put("/", requireAdmin, fileUpload.fields([
  { name: "heroImage", maxCount: 1 },
  { name: "heroVideo", maxCount: 1 },
  { name: "logo", maxCount: 1 },
  { name: "downloadFile0", maxCount: 1 },
  { name: "downloadFile1", maxCount: 1 },
  { name: "downloadFile2", maxCount: 1 }
]), async (req, res, next) => {
  try {
    const content = await getContentDocument();
    const body = { ...req.body };

    ["links", "heroStats", "services", "skillGroups", "publicDownloads", "highlightItems"].forEach((field) => {
      if (typeof body[field] === "string") {
        body[field] = JSON.parse(body[field]);
      }
    });

    const allowedFields = [
      "headerTitle",
      "headerSubtitle",
      "heroTitle",
      "heroBody",
      "heroImageUrl",
      "heroVideoUrl",
      "announcementText",
      "primaryButtonLabel",
      "primaryButtonUrl",
      "secondaryButtonLabel",
      "secondaryButtonUrl",
      "availabilityText",
      "heroStats",
      "logoUrl",
      "aboutTitle",
      "aboutBody",
      "aboutNote",
      "highlightTitle",
      "highlightBody",
      "highlightItems",
      "servicesTitle",
      "services",
      "skillsTitle",
      "skillGroups",
      "experienceTitle",
      "experienceBody",
      "publicDownloads",
      "testimonialsTitle",
      "projectsTitle",
      "downloadsTitle",
      "blogTitle",
      "contactTitle",
      "contactBody",
      "footerText",
      "email",
      "phone",
      "location",
      "links"
    ];

    allowedFields.forEach((field) => {
      if (field in body) {
        content[field] = body[field];
      }
    });

    if (req.files?.heroImage?.[0]) {
      content.heroImageUrl = await saveUploadedFile(req.files.heroImage[0]);
    }

    if (req.files?.heroVideo?.[0]) {
      content.heroVideoUrl = saveUploadedDiskFile(req.files.heroVideo[0]);
    }

    if (req.files?.logo?.[0]) {
      content.logoUrl = await saveUploadedFile(req.files.logo[0]);
    }

    const downloads = [...(content.publicDownloads || [])];
    for (const [index, download] of downloads.entries()) {
      const file = req.files?.[`downloadFile${index}`]?.[0];
      if (file) {
        download.fileUrl = await saveUploadedFile(file);
      }
    }
    content.publicDownloads = downloads;

    await content.save();
    res.json(content);
  } catch (error) {
    next(error);
  }
});

export default router;
