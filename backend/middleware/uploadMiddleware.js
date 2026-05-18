const fs = require("fs");
const path = require("path");
const multer = require("multer");

const createDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.uploadFolder || "misc";
    const destinationPath = path.join(__dirname, "..", "public", "uploads", folder);
    createDirectory(destinationPath);
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-").replace(/[^\w.-]/g, "");
    cb(null, `${Date.now()}-${safeName}`);
  }
});

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
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const assignUploadFolder = (folderName) => (req, res, next) => {
  req.uploadFolder = folderName;
  next();
};

module.exports = { upload, assignUploadFolder };
