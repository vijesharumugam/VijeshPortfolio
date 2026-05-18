const Profile = require("../models/Profile");

const normalizeList = (input) => {
  if (Array.isArray(input)) {
    return input.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof input === "string") {
    return input
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const parseJsonArray = (value, fallback = []) => {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
};

const getProfile = async (req, res) => {
  const profile = await Profile.findOne({ singletonKey: "default" });
  res.json(profile);
};

const updateProfile = async (req, res) => {
  const currentProfile = await Profile.findOne({ singletonKey: "default" });
  const payload = {
    brandName: req.body.brandName,
    fullName: req.body.fullName,
    role: req.body.role,
    typingRoles: normalizeList(req.body.typingRoles),
    intro: req.body.intro,
    heroDescription: req.body.heroDescription,
    aboutDescription: req.body.aboutDescription,
    careerObjective: req.body.careerObjective,
    passions: normalizeList(req.body.passions),
    strengths: normalizeList(req.body.strengths),
    focusAreas: parseJsonArray(req.body.focusAreas, currentProfile?.focusAreas || []),
    stats: parseJsonArray(req.body.stats, currentProfile?.stats || []),
    email: req.body.email,
    phone: req.body.phone,
    location: req.body.location,
    contactDescription: req.body.contactDescription,
    socialLinks: {
      github: req.body.github || "",
      linkedin: req.body.linkedin || "",
      email: req.body.socialEmail || req.body.email || "",
      leetcode: req.body.leetcode || ""
    }
  };

  if (req.files?.profileImage?.[0]) {
    payload.profileImageUrl = `/uploads/profile/${req.files.profileImage[0].filename}`;
  }

  if (req.files?.aboutImage?.[0]) {
    payload.aboutImageUrl = `/uploads/profile/${req.files.aboutImage[0].filename}`;
  }

  if (req.files?.resume?.[0]) {
    payload.resumeUrl = `/uploads/profile/${req.files.resume[0].filename}`;
  }

  const profile = await Profile.findOneAndUpdate(
    { singletonKey: "default" },
    { $set: payload },
    { new: true, runValidators: true }
  );

  res.json(profile);
};

module.exports = { getProfile, updateProfile };
