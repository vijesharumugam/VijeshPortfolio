const mongoose = require("mongoose");

const EducationSchema = new mongoose.Schema(
  {
    institutionName: { type: String, required: true, trim: true },
    institutionLogoUrl: { type: String, default: "" },
    degree: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    grade: { type: String, default: "", trim: true },
    description: { type: String, required: true, trim: true },
    skillsGained: [{ type: String, trim: true }],
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Education", EducationSchema);
