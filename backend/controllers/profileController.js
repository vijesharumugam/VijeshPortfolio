const Profile = require("../models/Profile");
const { uploadBufferToCloudinary } = require("../utils/cloudinaryUpload");
const { cloudinary } = require("../config/cloudinary");
const asyncHandler = require("../utils/asyncHandler");

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

const extractCloudinaryPublicId = (url) => {
  if (!url || !url.includes("res.cloudinary.com")) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const afterUpload = parts[1].replace(/^v\d+\//, "");
    const isRaw = url.includes("/raw/upload/");
    return isRaw ? afterUpload : afterUpload.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
};

const cleanupCloudinaryAsset = async (url) => {
  const publicId = extractCloudinaryPublicId(url);
  if (!publicId) return;
  const isRaw = url.includes("/raw/upload/");
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: isRaw ? "raw" : "image"
    });
  } catch (err) {
    console.warn(`Cloudinary cleanup failed for ${publicId}:`, err.message);
  }
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

const getProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ singletonKey: "default" });
  if (!profile) {
    return res.status(404).json({ message: "Profile not found. Please seed the database first." });
  }
  res.json(profile);
});

const updateProfile = asyncHandler(async (req, res) => {
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
    if (currentProfile?.profileImageUrl) {
      await cleanupCloudinaryAsset(currentProfile.profileImageUrl);
    }
    const uploaded = await uploadBufferToCloudinary(req.files.profileImage[0], "profile");
    payload.profileImageUrl = uploaded.secure_url;
  }

  if (req.files?.aboutImage?.[0]) {
    if (currentProfile?.aboutImageUrl) {
      await cleanupCloudinaryAsset(currentProfile.aboutImageUrl);
    }
    const uploaded = await uploadBufferToCloudinary(req.files.aboutImage[0], "profile");
    payload.aboutImageUrl = uploaded.secure_url;
  }

  if (req.files?.resume?.[0]) {
    if (currentProfile?.resumeUrl) {
      await cleanupCloudinaryAsset(currentProfile.resumeUrl);
    }
    const uploaded = await uploadBufferToCloudinary(req.files.resume[0], "profile");
    payload.resumeUrl = uploaded.secure_url;
  }

  const profile = await Profile.findOneAndUpdate(
    { singletonKey: "default" },
    { $set: payload },
    { new: true, runValidators: true, upsert: false }
  );

  if (!profile) {
    return res.status(404).json({ message: "Profile record not found. Run the server once to seed initial data." });
  }

  res.json(profile);
});
const toggleMaintenance = asyncHandler(async (req, res) => {
  const { maintenanceMode } = req.body;
  const profile = await Profile.findOneAndUpdate(
    { singletonKey: "default" },
    { $set: { maintenanceMode } },
    { new: true, runValidators: true }
  );
  if (!profile) return res.status(404).json({ message: "Profile not found." });
  res.json(profile);
});

module.exports = { getProfile, updateProfile, toggleMaintenance };
