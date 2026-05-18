const express = require("express");
const {
  getCertifications,
  createCertification,
  updateCertification,
  deleteCertification
} = require("../controllers/certificationController");
const { protect } = require("../middleware/authMiddleware");
const { upload, assignUploadFolder } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getCertifications);
router.post(
  "/",
  protect,
  assignUploadFolder("certifications"),
  upload.single("certificate"),
  createCertification
);
router.put(
  "/:id",
  protect,
  assignUploadFolder("certifications"),
  upload.single("certificate"),
  updateCertification
);
router.delete("/:id", protect, deleteCertification);

module.exports = router;
