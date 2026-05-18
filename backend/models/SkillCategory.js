const mongoose = require("mongoose");

const SkillItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    level: { type: Number, min: 0, max: 100, default: 75 }
  },
  { _id: false }
);

const SkillCategorySchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    skills: [SkillItemSchema],
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SkillCategory", SkillCategorySchema);
