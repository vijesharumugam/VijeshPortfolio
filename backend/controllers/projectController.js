const Project = require("../models/Project");
const { uploadBufferToCloudinary } = require("../utils/cloudinaryUpload");
const { cloudinary } = require("../config/cloudinary");
const asyncHandler = require("../utils/asyncHandler");

const normalizeList = (input) =>
  String(input || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

/**
 * Extracts the Cloudinary public_id from a Cloudinary URL.
 * Cloudinary image URL format:
 *   https://res.cloudinary.com/<cloud>/image/upload/v<ver>/<folder>/<public_id>.<ext>
 * Cloudinary raw URL format:
 *   https://res.cloudinary.com/<cloud>/raw/upload/v<ver>/<folder>/<public_id>
 *
 * Returns null for non-Cloudinary URLs (e.g. local /uploads/ paths).
 */
const extractCloudinaryPublicId = (url) => {
  if (!url || !url.includes("res.cloudinary.com")) return null;

  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;

    // Strip versioning segment (v12345678/) if present
    const afterUpload = parts[1].replace(/^v\d+\//, "");

    // For image resources, strip the file extension
    const isRaw = url.includes("/raw/upload/");
    return isRaw ? afterUpload : afterUpload.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
};

/**
 * Deletes a list of Cloudinary assets. Failures are logged but not thrown
 * so a delete operation on the DB still succeeds even if Cloudinary cleanup fails.
 */
const cleanupCloudinaryAssets = async (urls) => {
  const deletePromises = urls
    .map((url) => {
      const publicId = extractCloudinaryPublicId(url);
      if (!publicId) return null;

      const isRaw = url.includes("/raw/upload/");
      return cloudinary.uploader
        .destroy(publicId, { resource_type: isRaw ? "raw" : "image" })
        .catch((err) => {
          console.warn(`Cloudinary cleanup failed for ${publicId}:`, err.message);
        });
    })
    .filter(Boolean);

  await Promise.all(deletePromises);
};

const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find().sort({ order: 1, createdAt: -1 });
  res.json(projects);
});

const createProject = asyncHandler(async (req, res) => {
  const files = req.files || [];
  const uploadedImages = await Promise.all(
    files.map((file) => uploadBufferToCloudinary(file, "projects"))
  );

  const project = await Project.create({
    title: req.body.title,
    description: req.body.description,
    technologies: normalizeList(req.body.technologies),
    features: normalizeList(req.body.features),
    githubUrl: req.body.githubUrl,
    liveUrl: req.body.liveUrl,
    status: req.body.status || "Completed",
    images: uploadedImages.map((image) => image.secure_url),
    order: Number(req.body.order || 0)
  });

  res.status(201).json(project);
});

const updateProject = asyncHandler(async (req, res) => {
  const existingProject = await Project.findById(req.params.id);
  if (!existingProject) {
    return res.status(404).json({ message: "Project not found" });
  }

  const files = req.files || [];
  const retainedImages = normalizeList(req.body.existingImages);
  const uploadedImages = await Promise.all(
    files.map((file) => uploadBufferToCloudinary(file, "projects"))
  );
  const newImagePaths = uploadedImages.map((image) => image.secure_url);

  // Clean up Cloudinary images that were removed (not in retainedImages)
  const removedImages = (existingProject.images || []).filter(
    (url) => !retainedImages.includes(url)
  );
  if (removedImages.length > 0) {
    await cleanupCloudinaryAssets(removedImages);
  }

  const payload = {
    title: req.body.title,
    description: req.body.description,
    technologies: normalizeList(req.body.technologies),
    features: normalizeList(req.body.features),
    githubUrl: req.body.githubUrl,
    liveUrl: req.body.liveUrl,
    status: req.body.status || "Completed",
    order: Number(req.body.order || 0),
    images: [...retainedImages, ...newImagePaths]
  };

  const project = await Project.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  res.json(project);
});

const deleteProject = asyncHandler(async (req, res) => {
  const existing = await Project.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Project not found" });
  }

  // Clean up all Cloudinary images before deleting the DB record
  if (existing.images && existing.images.length > 0) {
    await cleanupCloudinaryAssets(existing.images);
  }

  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: "Project deleted" });
});

module.exports = { getProjects, createProject, updateProject, deleteProject };
