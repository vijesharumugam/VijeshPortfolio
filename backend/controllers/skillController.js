const SkillCategory = require("../models/SkillCategory");

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

const getSkillCategories = async (req, res) => {
  const categories = await SkillCategory.find().sort({ order: 1, createdAt: -1 });
  res.json(categories);
};

const createSkillCategory = async (req, res) => {
  const category = await SkillCategory.create({
    category: req.body.category,
    skills: parseSkills(req.body.skills),
    order: Number(req.body.order || 0)
  });

  res.status(201).json(category);
};

const updateSkillCategory = async (req, res) => {
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
};

const deleteSkillCategory = async (req, res) => {
  await SkillCategory.findByIdAndDelete(req.params.id);
  res.json({ message: "Skill category deleted" });
};

module.exports = {
  getSkillCategories,
  createSkillCategory,
  updateSkillCategory,
  deleteSkillCategory
};
