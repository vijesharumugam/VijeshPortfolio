const mongoose = require("mongoose");

const ExperienceSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    companyLogoUrl: { type: String, default: "" },
    role: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    location: { type: String, default: "", trim: true },
    description: { type: String, required: true, trim: true },
    skillsGained: [{ type: String, trim: true }],
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Experience", ExperienceSchema);
