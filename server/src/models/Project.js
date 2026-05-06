import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    imageUrl: {
      type: String,
      default: ""
    },
    liveUrl: {
      type: String,
      default: "",
      trim: true
    },
    repoUrl: {
      type: String,
      default: "",
      trim: true
    },
    technologies: {
      type: [String],
      default: []
    },
    featured: {
      type: Boolean,
      default: false
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
