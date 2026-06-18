const express = require("express");
const {
  getCertifications,
  createCertification,
  updateCertification,
  deleteCertification
} = require("../controllers/certificationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getCertifications);
router.post("/", protect, createCertification);
router.put("/:id", protect, updateCertification);
router.delete("/:id", protect, deleteCertification);

module.exports = router;
