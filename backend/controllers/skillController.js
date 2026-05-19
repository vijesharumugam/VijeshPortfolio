const SkillCategory = require("../models/SkillCategory");
const asyncHandler = require("../utils/asyncHandler");

const parseSkills = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const getSkillCategories = asyncHandler(async (req, res) => {
  const categories = await SkillCategory.find().sort({ order: 1, createdAt: -1 });
  res.json(categories);
});

const createSkillCategory = asyncHandler(async (req, res) => {
  const category = await SkillCategory.create({
    category: req.body.category,
    skills: parseSkills(req.body.skills),
    order: Number(req.body.order || 0)
  });

  res.status(201).json(category);
});

const updateSkillCategory = asyncHandler(async (req, res) => {
  const existing = await SkillCategory.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Skill category not found" });
  }

  const category = await SkillCategory.findByIdAndUpdate(
    req.params.id,
    {
      category: req.body.category,
      skills: parseSkills(req.body.skills),
      order: Number(req.body.order || 0)
    },
    { new: true, runValidators: true }
  );

  res.json(category);
});

const deleteSkillCategory = asyncHandler(async (req, res) => {
  const existing = await SkillCategory.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Skill category not found" });
  }

  await SkillCategory.findByIdAndDelete(req.params.id);
  res.json({ message: "Skill category deleted" });
});

module.exports = {
  getSkillCategories,
  createSkillCategory,
  updateSkillCategory,
  deleteSkillCategory
};
