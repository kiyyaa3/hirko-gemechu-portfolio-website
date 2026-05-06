import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: "" },
    tags: { type: [String], default: [] },
    published: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
