const express = require("express");
const { loginAdmin, getSession } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per `window`
  message: { message: "Too many login attempts from this IP, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false
});

const router = express.Router();

router.post("/login", loginLimiter, loginAdmin);
router.get("/session", protect, getSession);

module.exports = router;
