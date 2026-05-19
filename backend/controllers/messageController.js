const Message = require("../models/Message");
const Experience = require("../models/Experience");
const Education = require("../models/Education");
const Project = require("../models/Project");
const Certification = require("../models/Certification");
const SkillCategory = require("../models/SkillCategory");
const asyncHandler = require("../utils/asyncHandler");

const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
});

const createMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "All contact form fields are required" });
  }

  const savedMessage = await Message.create({ name, email, subject, message });
  res.status(201).json({ message: "Message sent successfully", savedMessage });
});

const markMessageRead = asyncHandler(async (req, res) => {
  const updatedMessage = await Message.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );

  if (!updatedMessage) {
    return res.status(404).json({ message: "Message not found" });
  }

  res.json(updatedMessage);
});

const deleteMessage = asyncHandler(async (req, res) => {
  const existing = await Message.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Message not found" });
  }

  await Message.findByIdAndDelete(req.params.id);
  res.json({ message: "Message deleted" });
});

const getDashboardSummary = asyncHandler(async (req, res) => {
  const [messages, experiences, education, projects, certifications, skills] = await Promise.all([
    Message.countDocuments(),
    Experience.countDocuments(),
    Education.countDocuments(),
    Project.countDocuments(),
    Certification.countDocuments(),
    SkillCategory.countDocuments()
  ]);

  const recentMessages = await Message.find().sort({ createdAt: -1 }).limit(5);

  res.json({
    cards: [
      { label: "Messages", value: messages },
      { label: "Experiences", value: experiences },
      { label: "Education", value: education },
      { label: "Projects", value: projects },
      { label: "Certifications", value: certifications },
      { label: "Skill Groups", value: skills }
    ],
    recentMessages
  });
});

module.exports = {
  getMessages,
  createMessage,
  markMessageRead,
  deleteMessage,
  getDashboardSummary
};
