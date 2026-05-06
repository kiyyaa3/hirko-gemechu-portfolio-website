import "./config.js";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";
import Project from "./models/Project.js";
import SiteContent from "./models/SiteContent.js";
import Asset from "./models/Asset.js";
import Post from "./models/Post.js";
import Testimonial from "./models/Testimonial.js";
import { connectDb } from "./db.js";

const starterProjects = [
  {
    title: "Inventory Management System",
    category: "Business System",
    description: "A stock and sales tracking system with admin workflows, reporting, and responsive interface design.",
    imageUrl: "/starter/project1.png",
    technologies: ["PHP", "MySQL", "Bootstrap", "Authentication"],
    featured: true,
    sortOrder: 1
  },
  {
    title: "Class Schedule System",
    category: "University Tool",
    description: "A scheduling platform for class timetables, rooms, and faculty allocation.",
    technologies: ["PHP", "MySQL", "JavaScript"],
    featured: true,
    sortOrder: 2
  },
  {
    title: "Enter Africa Website",
    category: "Corporate Website",
    description: "A corporate web presence for Kerchanshe Group's Enter Africa initiative.",
    liveUrl: "http://kerchanshe.co/enterafrica/",
    technologies: ["WordPress", "CSS", "Content"],
    featured: true,
    sortOrder: 3
  }
];

async function seed() {
  await connectDb();

  const email = process.env.ADMIN_EMAIL || "admin@hirko.dev";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 12);

  await Admin.findOneAndUpdate(
    { email },
    { name: "Hirko Admin", email, passwordHash },
    { upsert: true, new: true }
  );

  const projectCount = await Project.countDocuments();
  if (projectCount === 0) {
    await Project.insertMany(starterProjects);
  }

  const content = await SiteContent.findOne();
  if (!content) {
    await SiteContent.create({});
  }

  const assetCount = await Asset.countDocuments();
  if (assetCount === 0) {
    await Asset.create({
      title: "Profile Image",
      description: "Starter profile image used by the portfolio.",
      category: "Image",
      fileUrl: "/starter/hirko-optimized.jpg",
      fileName: "hirko-optimized.jpg",
      mimeType: "image/jpeg",
      public: true,
      sortOrder: 1
    });
  }

  const postCount = await Post.countDocuments();
  if (postCount === 0) {
    await Post.insertMany([
      {
        title: "Why I upgraded my portfolio to MERN",
        excerpt: "A short update about moving from static HTML to a database-powered portfolio CMS.",
        body: "This portfolio now uses MongoDB, Express, React, and Node so projects, files, testimonials, and messages can be managed from an admin dashboard.",
        tags: ["MERN", "Portfolio", "Admin"],
        published: true,
        sortOrder: 1
      },
      {
        title: "Building admin tools for real users",
        excerpt: "Good admin dashboards should be clear, fast, and focused on daily work.",
        body: "The admin side is designed to make common updates easy: content editing, project posting, file upload, and message management.",
        tags: ["Dashboard", "UX", "Development"],
        published: true,
        sortOrder: 2
      }
    ]);
  }

  const testimonialCount = await Testimonial.countDocuments();
  if (testimonialCount === 0) {
    await Testimonial.insertMany([
      {
        name: "Portfolio CMS",
        role: "System capability",
        quote: "Admin can manage projects, downloads, website content, blog posts, certificates, and messages from one dashboard.",
        type: "testimonial",
        public: true,
        sortOrder: 1
      },
      {
        name: "Software Engineering",
        role: "BSc background",
        quote: "Education and project work focused on full-stack development, databases, and practical software systems.",
        type: "certificate",
        public: true,
        sortOrder: 2
      }
    ]);
  }

  console.log(`Admin ready: ${email}`);
  console.log(projectCount === 0 ? "Starter projects added" : "Existing projects kept");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
