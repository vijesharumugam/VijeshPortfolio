const Certification = require("../models/Certification");
const { uploadBufferToCloudinary, deleteCloudinaryAsset } = require("../utils/cloudinaryUpload");
const asyncHandler = require("../utils/asyncHandler");
const { isDatabaseConnected } = require("../config/db");
const { getFallbackCertifications } = require("../utils/fallbackData");

const normalizeList = (input) =>
  String(input || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const getCertifications = asyncHandler(async (req, res) => {
  if (!isDatabaseConnected()) {
    return res.json(getFallbackCertifications());
  }

  const certifications = await Certification.find().sort({ order: 1, completionDate: -1, createdAt: -1 });
  res.json(certifications);
});

const createCertification = asyncHandler(async (req, res) => {
  const uploadedCertificate = req.file
    ? await uploadBufferToCloudinary(req.file, "certifications")
    : null;

  const certification = await Certification.create({
    title: req.body.title,
    issuer: req.body.issuer,
    certificateFileUrl: uploadedCertificate?.secure_url || "",
    skillsGained: normalizeList(req.body.skillsGained),
    completionDate: req.body.completionDate,
    order: Number(req.body.order || 0)
  });

  res.status(201).json(certification);
});

const updateCertification = asyncHandler(async (req, res) => {
  const existing = await Certification.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Certification not found" });
  }

  const payload = {
    title: req.body.title,
    issuer: req.body.issuer,
    skillsGained: normalizeList(req.body.skillsGained),
    completionDate: req.body.completionDate,
    order: Number(req.body.order || 0)
  };

  if (req.file) {
    // Clean up the old Cloudinary asset before uploading the new one
    if (existing.certificateFileUrl) {
      await deleteCloudinaryAsset(existing.certificateFileUrl);
    }
    const uploadedCertificate = await uploadBufferToCloudinary(req.file, "certifications");
    payload.certificateFileUrl = uploadedCertificate.secure_url;
  }

  const certification = await Certification.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  res.json(certification);
});

const deleteCertification = asyncHandler(async (req, res) => {
  const existing = await Certification.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Certification not found" });
  }

  // Clean up the Cloudinary asset before removing the DB record
  if (existing.certificateFileUrl) {
    await deleteCloudinaryAsset(existing.certificateFileUrl);
  }

  await Certification.findByIdAndDelete(req.params.id);
  res.json({ message: "Certification deleted" });
});

module.exports = {
  getCertifications,
  createCertification,
  updateCertification,
  deleteCertification
};
