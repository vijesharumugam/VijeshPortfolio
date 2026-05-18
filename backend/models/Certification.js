const mongoose = require("mongoose");

const CertificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    issuer: { type: String, required: true, trim: true },
    certificateFileUrl: { type: String, default: "" },
    skillsGained: [{ type: String, trim: true }],
    completionDate: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certification", CertificationSchema);
