const express = require("express");
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject
} = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");
const { upload, assignUploadFolder } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getProjects);
router.post("/", protect, assignUploadFolder("projects"), upload.array("images", 10), createProject);
router.put("/:id", protect, assignUploadFolder("projects"), upload.array("images", 10), updateProject);
router.delete("/:id", protect, deleteProject);

module.exports = router;
