const Certification = require("../models/Certification");
const { uploadBufferToCloudinary } = require("../utils/cloudinaryUpload");

const normalizeList = (input) =>
  String(input || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const getCertifications = async (req, res) => {
  const certifications = await Certification.find().sort({ completionDate: -1, createdAt: -1 });
  res.json(certifications);
};

const createCertification = async (req, res) => {
  const uploadedCertificate = req.file
    ? await uploadBufferToCloudinary(req.file, "certifications")
    : null;

  const certification = await Certification.create({
    title: req.body.title,
    issuer: req.body.issuer,
    certificateFileUrl: uploadedCertificate?.secure_url || "",
    skillsGained: normalizeList(req.body.skillsGained),
    completionDate: req.body.completionDate
  });

  res.status(201).json(certification);
};

const updateCertification = async (req, res) => {
  const payload = {
    title: req.body.title,
    issuer: req.body.issuer,
    skillsGained: normalizeList(req.body.skillsGained),
    completionDate: req.body.completionDate
  };

  if (req.file) {
    const uploadedCertificate = await uploadBufferToCloudinary(req.file, "certifications");
    payload.certificateFileUrl = uploadedCertificate.secure_url;
  }

  const certification = await Certification.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  res.json(certification);
};

const deleteCertification = async (req, res) => {
  await Certification.findByIdAndDelete(req.params.id);
  res.json({ message: "Certification deleted" });
};

module.exports = {
  getCertifications,
  createCertification,
  updateCertification,
  deleteCertification
};
