const Education = require("../models/Education");
const { uploadBufferToCloudinary, deleteCloudinaryAsset } = require("../utils/cloudinaryUpload");
const asyncHandler = require("../utils/asyncHandler");
const { isDatabaseConnected } = require("../config/db");
const { getFallbackEducation } = require("../utils/fallbackData");

const normalizeList = (input) =>
  String(input || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const getEducation = asyncHandler(async (req, res) => {
  if (!isDatabaseConnected()) {
    return res.json(getFallbackEducation());
  }

  const education = await Education.find().sort({ order: 1, createdAt: -1 });
  res.json(education);
});

const createEducation = asyncHandler(async (req, res) => {
  const uploadedLogo = req.file
    ? await uploadBufferToCloudinary(req.file, "education")
    : null;

  const education = await Education.create({
    institutionName: req.body.institutionName,
    institutionLogoUrl: uploadedLogo?.secure_url || "",
    degree: req.body.degree,
    duration: req.body.duration,
    grade: req.body.grade,
    description: req.body.description,
    skillsGained: normalizeList(req.body.skillsGained),
    order: Number(req.body.order || 0)
  });

  res.status(201).json(education);
});

const updateEducation = asyncHandler(async (req, res) => {
  const existing = await Education.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Education record not found" });
  }

  const payload = {
    institutionName: req.body.institutionName,
    degree: req.body.degree,
    duration: req.body.duration,
    grade: req.body.grade,
    description: req.body.description,
    skillsGained: normalizeList(req.body.skillsGained),
    order: Number(req.body.order || 0)
  };

  if (req.file) {
    if (existing.institutionLogoUrl) {
      await deleteCloudinaryAsset(existing.institutionLogoUrl);
    }
    const uploadedLogo = await uploadBufferToCloudinary(req.file, "education");
    payload.institutionLogoUrl = uploadedLogo.secure_url;
  }

  const education = await Education.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  res.json(education);
});

const deleteEducation = asyncHandler(async (req, res) => {
  const existing = await Education.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Education record not found" });
  }

  if (existing.institutionLogoUrl) {
    await deleteCloudinaryAsset(existing.institutionLogoUrl);
  }
  await Education.findByIdAndDelete(req.params.id);
  res.json({ message: "Education deleted" });
});

module.exports = { getEducation, createEducation, updateEducation, deleteEducation };
