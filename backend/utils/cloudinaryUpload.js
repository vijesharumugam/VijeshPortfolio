const streamifier = require("streamifier");
const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");

const getResourceType = (file) => {
  if (file?.mimetype === "application/pdf") {
    return "raw";
  }

  return "image";
};

const buildPublicId = (file) => {
  const resourceType = getResourceType(file);
  const originalName = file?.originalname || "upload";
  const extensionMatch = originalName.match(/(\.[^.]+)$/);
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : "";
  const baseName = originalName
    .replace(/\.[^.]+$/, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .slice(0, 60);

  if (resourceType === "raw") {
    return `${Date.now()}-${baseName || "upload"}${extension}`;
  }

  return `${Date.now()}-${baseName || "upload"}`;
};

const uploadBufferToCloudinary = (file, folder, options = {}) =>
  new Promise((resolve, reject) => {
    if (!file?.buffer) {
      return reject(new Error("Upload file buffer is missing"));
    }

    if (!isCloudinaryConfigured()) {
      return reject(
        new Error("Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.")
      );
    }

    const uploadOptions = {
      folder: `vijesh-portfolio/${folder}`,
      resource_type: getResourceType(file),
      public_id: buildPublicId(file),
      ...options
    };

    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });

module.exports = { uploadBufferToCloudinary };
