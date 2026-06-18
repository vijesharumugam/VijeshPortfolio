const Project = require("../models/Project");
const { uploadBufferToCloudinary, deleteCloudinaryAssets } = require("../utils/cloudinaryUpload");
const asyncHandler = require("../utils/asyncHandler");
const { isDatabaseConnected } = require("../config/db");
const { getFallbackProjects } = require("../utils/fallbackData");

const normalizeList = (input) =>
  String(input || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const getProjects = asyncHandler(async (req, res) => {
  if (!isDatabaseConnected()) {
    return res.json(getFallbackProjects());
  }

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
    await deleteCloudinaryAssets(removedImages);
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
    await deleteCloudinaryAssets(existing.images);
  }

  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: "Project deleted" });
});

module.exports = { getProjects, createProject, updateProject, deleteProject };
