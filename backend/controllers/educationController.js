const Education = require("../models/Education");

const normalizeList = (input) =>
  String(input || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const getEducation = async (req, res) => {
  const education = await Education.find().sort({ order: 1, createdAt: -1 });
  res.json(education);
};

const createEducation = async (req, res) => {
  const education = await Education.create({
    institutionName: req.body.institutionName,
    institutionLogoUrl: req.file ? `/uploads/education/${req.file.filename}` : "",
    degree: req.body.degree,
    duration: req.body.duration,
    grade: req.body.grade,
    description: req.body.description,
    skillsGained: normalizeList(req.body.skillsGained),
    order: Number(req.body.order || 0)
  });

  res.status(201).json(education);
};

const updateEducation = async (req, res) => {
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
    payload.institutionLogoUrl = `/uploads/education/${req.file.filename}`;
  }

  const education = await Education.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  res.json(education);
};

const deleteEducation = async (req, res) => {
  await Education.findByIdAndDelete(req.params.id);
  res.json({ message: "Education deleted" });
};

module.exports = { getEducation, createEducation, updateEducation, deleteEducation };
