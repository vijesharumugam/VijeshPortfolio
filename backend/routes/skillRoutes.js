const express = require("express");
const {
  getSkillCategories,
  createSkillCategory,
  updateSkillCategory,
  deleteSkillCategory
} = require("../controllers/skillController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getSkillCategories);
router.post("/", protect, createSkillCategory);
router.put("/:id", protect, updateSkillCategory);
router.delete("/:id", protect, deleteSkillCategory);

module.exports = router;
