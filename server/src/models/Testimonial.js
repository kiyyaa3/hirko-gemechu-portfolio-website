import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, default: "", trim: true },
    quote: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["testimonial", "certificate"],
      default: "testimonial"
    },
    imageUrl: { type: String, default: "" },
    fileUrl: { type: String, default: "" },
    public: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Testimonial", testimonialSchema);
