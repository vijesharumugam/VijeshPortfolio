const Experience = require("../models/Experience");

const normalizeList = (input) =>
  String(input || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const getExperiences = async (req, res) => {
  const experiences = await Experience.find().sort({ order: 1, createdAt: -1 });
  res.json(experiences);
};

const createExperience = async (req, res) => {
  const experience = await Experience.create({
    companyName: req.body.companyName,
    companyLogoUrl: req.file ? `/uploads/experience/${req.file.filename}` : "",
    role: req.body.role,
    duration: req.body.duration,
    location: req.body.location,
    description: req.body.description,
    skillsGained: normalizeList(req.body.skillsGained),
    order: Number(req.body.order || 0)
  });

  res.status(201).json(experience);
};

const updateExperience = async (req, res) => {
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
    payload.companyLogoUrl = `/uploads/experience/${req.file.filename}`;
  }

  const experience = await Experience.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  res.json(experience);
};

const deleteExperience = async (req, res) => {
  await Experience.findByIdAndDelete(req.params.id);
  res.json({ message: "Experience deleted" });
};

module.exports = {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience
};
