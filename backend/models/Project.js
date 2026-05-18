const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    technologies: [{ type: String, trim: true }],
    features: [{ type: String, trim: true }],
    githubUrl: { type: String, default: "" },
    liveUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Completed", "Ongoing"],
      default: "Completed"
    },
    images: [{ type: String, trim: true }],
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", ProjectSchema);
