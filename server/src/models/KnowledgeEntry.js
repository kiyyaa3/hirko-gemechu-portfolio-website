import mongoose from "mongoose";

const knowledgeEntrySchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: "General",
      trim: true
    },
    sourceUrl: {
      type: String,
      default: "",
      trim: true
    },
    aliases: {
      type: [String],
      default: []
    },
    public: {
      type: Boolean,
      default: true
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("KnowledgeEntry", knowledgeEntrySchema);
