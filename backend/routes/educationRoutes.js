const express = require("express");
const {
  getEducation,
  createEducation,
  updateEducation,
  deleteEducation
} = require("../controllers/educationController");
const { protect } = require("../middleware/authMiddleware");
const { upload, assignUploadFolder } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getEducation);
router.post("/", protect, assignUploadFolder("education"), upload.single("logo"), createEducation);
router.put("/:id", protect, assignUploadFolder("education"), upload.single("logo"), updateEducation);
router.delete("/:id", protect, deleteEducation);

module.exports = router;
