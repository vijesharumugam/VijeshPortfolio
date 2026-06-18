const Experience = require("../models/Experience");
const { uploadBufferToCloudinary } = require("../utils/cloudinaryUpload");
const { cloudinary } = require("../config/cloudinary");
const asyncHandler = require("../utils/asyncHandler");

const normalizeList = (input) =>
  String(input || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

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

const getExperiences = asyncHandler(async (req, res) => {
  const experiences = await Experience.find().sort({ order: 1, createdAt: -1 });
  res.json(experiences);
});

const createExperience = asyncHandler(async (req, res) => {
  const uploadedLogo = req.file
    ? await uploadBufferToCloudinary(req.file, "experience")
    : null;

  const experience = await Experience.create({
    companyName: req.body.companyName,
    companyLogoUrl: uploadedLogo?.secure_url || "",
    role: req.body.role,
    duration: req.body.duration,
    location: req.body.location,
    description: req.body.description,
    skillsGained: normalizeList(req.body.skillsGained),
    order: Number(req.body.order || 0)
  });

  res.status(201).json(experience);
});

const updateExperience = asyncHandler(async (req, res) => {
  const existing = await Experience.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Experience record not found" });
  }

  const payload = {
    companyName: req.body.companyName,
    role: req.body.role,
    duration: req.body.duration,
    location: req.body.location,
    description: req.body.description,
    skillsGained: normalizeList(req.body.skillsGained),
    order: Number(req.body.order || 0)
  };

  if (req.file) {
    if (existing.companyLogoUrl) {
      await cleanupCloudinaryAsset(existing.companyLogoUrl);
    }
    const uploadedLogo = await uploadBufferToCloudinary(req.file, "experience");
    payload.companyLogoUrl = uploadedLogo.secure_url;
  }

  const experience = await Experience.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  res.json(experience);
});

const deleteExperience = asyncHandler(async (req, res) => {
  const existing = await Experience.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Experience record not found" });
  }

  if (existing.companyLogoUrl) {
    await cleanupCloudinaryAsset(existing.companyLogoUrl);
  }
  await Experience.findByIdAndDelete(req.params.id);
  res.json({ message: "Experience deleted" });
});

module.exports = {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience
};
