const express = require("express");
const { getProfile, updateProfile, toggleMaintenance } = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");
const { upload, assignUploadFolder } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getProfile);
router.put(
  "/",
  protect,
  assignUploadFolder("profile"),
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "aboutImage", maxCount: 1 },
    { name: "resume", maxCount: 1 }
  ]),
  updateProfile
);
router.put("/maintenance", protect, toggleMaintenance);

module.exports = router;
