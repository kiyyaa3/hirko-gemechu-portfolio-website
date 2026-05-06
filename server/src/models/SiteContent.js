import mongoose from "mongoose";

const linkSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    url: { type: String, trim: true }
  },
  { _id: false }
);

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    icon: { type: String, trim: true, default: "Laptop" }
  },
  { _id: false }
);

const skillGroupSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    icon: { type: String, trim: true, default: "Code2" },
    items: { type: [String], default: [] }
  },
  { _id: false }
);

const downloadSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    category: { type: String, trim: true },
    fileUrl: { type: String, trim: true }
  },
  { _id: false }
);

const statSchema = new mongoose.Schema(
  {
    value: { type: String, trim: true },
    label: { type: String, trim: true }
  },
  { _id: false }
);

const siteContentSchema = new mongoose.Schema(
  {
    headerTitle: {
      type: String,
      default: "Hirko Gemechu"
    },
    headerSubtitle: {
      type: String,
      default: "Software Engineer | MERN Developer | Systems Builder"
    },
    heroTitle: {
      type: String,
      default: "Building clean websites, dashboards, and business systems."
    },
    heroBody: {
      type: String,
      default: "I build practical full-stack products that look professional and are easy to manage."
    },
    heroImageUrl: {
      type: String,
      default: "/starter/hirko-optimized.jpg"
    },
    heroStats: {
      type: [statSchema],
      default: [
        { value: "Admin", label: "Project control panel" },
        { value: "MERN", label: "Mongo, Express, React, Node" },
        { value: "Upload", label: "Project images supported" }
      ]
    },
    logoUrl: {
      type: String,
      default: "/starter/logo.png"
    },
    aboutTitle: {
      type: String,
      default: "Full-stack development with practical support experience."
    },
    aboutBody: {
      type: String,
      default: "I build responsive websites, business systems, admin dashboards, and technical support solutions."
    },
    aboutNote: {
      type: String,
      default: "The admin can log in, add projects, upload images, edit details, feature projects, and delete old work."
    },
    footerText: {
      type: String,
      default: "2026 Hirko Gemechu. All rights reserved."
    },
    email: {
      type: String,
      default: "hirkogemechu10@gmail.com"
    },
    phone: {
      type: String,
      default: "+251973100900"
    },
    location: {
      type: String,
      default: "Ethiopia"
    },
    links: {
      type: [linkSchema],
      default: [
        { label: "LinkedIn", url: "https://linkedin.com/in/hirko-gemechu10" },
        { label: "Facebook", url: "https://facebook.com/qaajela.gamee" }
      ]
    },
    servicesTitle: {
      type: String,
      default: "What I can build"
    },
    services: {
      type: [serviceSchema],
      default: [
        { title: "Web Development", description: "Modern responsive websites, landing pages, portfolios, and company sites.", icon: "Laptop" },
        { title: "Business Systems", description: "Inventory, schedules, dashboards, reporting, and admin workflows.", icon: "Database" },
        { title: "Technical Support", description: "System support, troubleshooting, CCTV systems, and operational documentation.", icon: "ShieldCheck" }
      ]
    },
    skillsTitle: {
      type: String,
      default: "Practical stack for websites, systems, and support."
    },
    skillGroups: {
      type: [skillGroupSchema],
      default: [
        { title: "Frontend", icon: "Code2", items: ["React", "JavaScript", "Responsive UI", "Bootstrap", "WordPress"] },
        { title: "Backend", icon: "Server", items: ["Node.js", "Express", "PHP", "REST APIs", "Authentication"] },
        { title: "Data & Support", icon: "Wrench", items: ["MongoDB", "MySQL", "Admin dashboards", "CCTV support", "Troubleshooting"] }
      ]
    },
    experienceTitle: {
      type: String,
      default: "MERN portfolio CMS with admin control"
    },
    experienceBody: {
      type: String,
      default: "This site includes project management, image uploads, blog posts, public downloads, testimonials, contact messages, and secure admin login."
    },
    publicDownloads: {
      type: [downloadSchema],
      default: [
        { title: "Hirko Gemechu CV", description: "Download my CV in DOCX format.", category: "CV", fileUrl: "/starter/hirko-gemechu-cv.docx" },
        { title: "Certificates", description: "A merged PDF of certificates and supporting documents.", category: "Certificates", fileUrl: "/starter/hirko-certificates.pdf" }
      ]
    },
    testimonialsTitle: {
      type: String,
      default: "Testimonials and certificates"
    },
    projectsTitle: {
      type: String,
      default: "Admin-managed project showcase"
    },
    downloadsTitle: {
      type: String,
      default: "Files shared by admin"
    },
    blogTitle: {
      type: String,
      default: "Latest updates"
    },
    contactTitle: {
      type: String,
      default: "Let us talk about your next project."
    },
    contactBody: {
      type: String,
      default: "Send me a message for websites, dashboards, business systems, technical support, or job opportunities."
    }
  },
  { timestamps: true }
);

export default mongoose.model("SiteContent", siteContentSchema);
