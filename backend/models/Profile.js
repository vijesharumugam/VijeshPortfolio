const mongoose = require("mongoose");

const FocusAreaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    icon: { type: String, default: "spark" }
  },
  { _id: false }
);

const StatSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: Number, required: true },
    suffix: { type: String, default: "" }
  },
  { _id: false }
);

const SocialLinksSchema = new mongoose.Schema(
  {
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    email: { type: String, default: "" },
    leetcode: { type: String, default: "" }
  },
  { _id: false }
);

const ProfileSchema = new mongoose.Schema(
  {
    singletonKey: { type: String, default: "default", unique: true },
    brandName: { type: String, required: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    typingRoles: [{ type: String, trim: true }],
    intro: { type: String, required: true, trim: true },
    heroDescription: { type: String, required: true, trim: true },
    profileImageUrl: { type: String, default: "" },
    aboutImageUrl: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    aboutDescription: { type: String, required: true, trim: true },
    careerObjective: { type: String, required: true, trim: true },
    passions: [{ type: String, trim: true }],
    strengths: [{ type: String, trim: true }],
    focusAreas: [FocusAreaSchema],
    stats: [StatSchema],
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    contactDescription: { type: String, required: true, trim: true },
    socialLinks: { type: SocialLinksSchema, default: () => ({}) },
    maintenanceMode: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", ProfileSchema);
