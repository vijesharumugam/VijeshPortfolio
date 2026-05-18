const express = require("express");
const { loginAdmin, getSession } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/session", protect, getSession);

module.exports = router;
