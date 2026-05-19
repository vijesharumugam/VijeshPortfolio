const Experience = require("../models/Experience");
const { uploadBufferToCloudinary } = require("../utils/cloudinaryUpload");
const asyncHandler = require("../utils/asyncHandler");

const normalizeList = (input) =>
  String(input || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

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

  await Experience.findByIdAndDelete(req.params.id);
  res.json({ message: "Experience deleted" });
});

module.exports = {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience
};
