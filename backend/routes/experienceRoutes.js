const express = require("express");
const {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience
} = require("../controllers/experienceController");
const { protect } = require("../middleware/authMiddleware");
const { upload, assignUploadFolder } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getExperiences);
router.post("/", protect, assignUploadFolder("experience"), upload.single("logo"), createExperience);
router.put("/:id", protect, assignUploadFolder("experience"), upload.single("logo"), updateExperience);
router.delete("/:id", protect, deleteExperience);

module.exports = router;
