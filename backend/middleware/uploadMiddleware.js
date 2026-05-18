const multer = require("multer");

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "application/pdf"
  ];

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only JPG, PNG, WEBP, SVG, and PDF files are allowed"));
  }

  cb(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const assignUploadFolder = (folderName) => (req, res, next) => {
  req.uploadFolder = folderName;
  next();
};

module.exports = { upload, assignUploadFolder };
