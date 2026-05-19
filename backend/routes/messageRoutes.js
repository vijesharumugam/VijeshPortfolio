const express = require("express");
const {
  getMessages,
  createMessage,
  markMessageRead,
  deleteMessage,
  getDashboardSummary
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard/summary", protect, getDashboardSummary);
router.get("/", protect, getMessages);
router.post("/", createMessage);
router.put("/:id/read", protect, markMessageRead);
router.delete("/:id", protect, deleteMessage);

module.exports = router;
