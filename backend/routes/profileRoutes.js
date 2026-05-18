const express = require("express");
const { getProfile, updateProfile } = require("../controllers/profileController");
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

module.exports = router;
