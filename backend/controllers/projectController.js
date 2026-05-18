const Project = require("../models/Project");

const normalizeList = (input) =>
  String(input || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const getProjects = async (req, res) => {
  const projects = await Project.find().sort({ order: 1, createdAt: -1 });
  res.json(projects);
};

const createProject = async (req, res) => {
  const files = req.files || [];
  const project = await Project.create({
    title: req.body.title,
    description: req.body.description,
    technologies: normalizeList(req.body.technologies),
    features: normalizeList(req.body.features),
    githubUrl: req.body.githubUrl,
    liveUrl: req.body.liveUrl,
    status: req.body.status || "Completed",
    images: files.map((file) => `/uploads/projects/${file.filename}`),
    order: Number(req.body.order || 0)
  });

  res.status(201).json(project);
};

const updateProject = async (req, res) => {
  const existingProject = await Project.findById(req.params.id);
  const files = req.files || [];
  const retainedImages = normalizeList(req.body.existingImages);
  const newImagePaths = files.map((file) => `/uploads/projects/${file.filename}`);

  const payload = {
    title: req.body.title,
    description: req.body.description,
    technologies: normalizeList(req.body.technologies),
    features: normalizeList(req.body.features),
    githubUrl: req.body.githubUrl,
    liveUrl: req.body.liveUrl,
    status: req.body.status || "Completed",
    order: Number(req.body.order || 0)
  };

  if (existingProject) {
    payload.images = [...retainedImages, ...newImagePaths];
  } else {
    payload.images = newImagePaths;
  }

  const project = await Project.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  res.json(project);
};

const deleteProject = async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: "Project deleted" });
};

module.exports = { getProjects, createProject, updateProject, deleteProject };
