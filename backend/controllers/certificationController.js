const Certification = require("../models/Certification");
const { uploadBufferToCloudinary } = require("../utils/cloudinaryUpload");
const { cloudinary } = require("../config/cloudinary");
const asyncHandler = require("../utils/asyncHandler");

const normalizeList = (input) =>
  String(input || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

/**
 * Extracts the Cloudinary public_id from a Cloudinary URL.
 * Returns null for non-Cloudinary URLs (local /uploads/ paths).
 */
const extractCloudinaryPublicId = (url) => {
  if (!url || !url.includes("res.cloudinary.com")) return null;

  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;

    const afterUpload = parts[1].replace(/^v\d+\//, "");
    const isRaw = url.includes("/raw/upload/");
    return isRaw ? afterUpload : afterUpload.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
};

const cleanupCloudinaryAsset = async (url) => {
  const publicId = extractCloudinaryPublicId(url);
  if (!publicId) return;

  const isRaw = url.includes("/raw/upload/");
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: isRaw ? "raw" : "image"
    });
  } catch (err) {
    console.warn(`Cloudinary cleanup failed for ${publicId}:`, err.message);
  }
};

const getCertifications = asyncHandler(async (req, res) => {
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
      await cleanupCloudinaryAsset(existing.certificateFileUrl);
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
    await cleanupCloudinaryAsset(existing.certificateFileUrl);
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
