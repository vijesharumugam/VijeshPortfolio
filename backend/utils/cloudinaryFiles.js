const path = require("path");
const streamifier = require("streamifier");
const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");

const CLOUDINARY_FOLDER_ROOT = "vijesh-portfolio";

const isCloudinaryUrl = (value) =>
  typeof value === "string" && value.includes("res.cloudinary.com");

const sanitizeSlug = (value, fallback = "upload") => {
  const slug = String(value || fallback)
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w.-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
};

const sanitizeDownloadName = (value, fallback = "download.pdf") => {
  const name = String(value || fallback)
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w.-]/g, "");

  return name || fallback;
};

const getFileExtension = (fileName) => path.extname(String(fileName || "")).toLowerCase();

const getUploadResourceType = (file) => {
  const mimeType = String(file?.mimetype || "").toLowerCase();
  const extension = getFileExtension(file?.originalname);

  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (
    mimeType === "application/pdf" ||
    [".pdf", ".txt", ".csv", ".doc", ".docx", ".zip", ".rar"].includes(extension)
  ) {
    return "raw";
  }

  return "auto";
};

const buildPublicId = (file, resourceType) => {
  const originalName = String(file?.originalname || "upload");
  const extension = getFileExtension(originalName);
  const baseName = sanitizeSlug(path.basename(originalName, extension), "upload").slice(0, 60);
  const timestamp = Date.now();

  if (resourceType === "raw") {
    return `${timestamp}-${baseName}${extension}`;
  }

  return `${timestamp}-${baseName}`;
};

const buildUploadOptions = (file, folder, options = {}) => {
  const {
    resourceType,
    publicId,
    useFilename = false,
    uniqueFilename = true,
    overwrite = false,
    ...cloudinaryOptions
  } = options;

  const resolvedResourceType = resourceType || getUploadResourceType(file);
  const resolvedPublicId = publicId || buildPublicId(file, resolvedResourceType);

  return {
    folder: [CLOUDINARY_FOLDER_ROOT, folder].filter(Boolean).join("/"),
    resource_type: resolvedResourceType,
    public_id: resolvedPublicId,
    use_filename: useFilename,
    unique_filename: uniqueFilename,
    overwrite,
    ...cloudinaryOptions
  };
};

const uploadBufferToCloudinary = (file, folder, options = {}) =>
  new Promise((resolve, reject) => {
    if (!file?.buffer) {
      return reject(new Error("Upload file buffer is missing"));
    }

    if (!isCloudinaryConfigured()) {
      return reject(
        new Error(
          "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
        )
      );
    }

    const uploadOptions = buildUploadOptions(file, folder, options);
    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });

const getCloudinaryAssetInfo = (url) => {
  if (!isCloudinaryUrl(url)) return null;

  try {
    const parsedUrl = new URL(url);
    const uploadMarker = "/upload/";
    const uploadIndex = parsedUrl.pathname.indexOf(uploadMarker);

    if (uploadIndex === -1) {
      return null;
    }

    const afterUpload = parsedUrl.pathname.slice(uploadIndex + uploadMarker.length).replace(/^v\d+\//, "");
    const versionMatch = parsedUrl.pathname.match(/\/upload\/v(\d+)\//);
    const isRaw = parsedUrl.pathname.includes("/raw/upload/") || /\.pdf$/i.test(afterUpload);

    return {
      publicId: isRaw ? afterUpload : afterUpload.replace(/\.[^/.]+$/, ""),
      resourceType: isRaw ? "raw" : "image",
      version: versionMatch ? Number(versionMatch[1]) : undefined
    };
  } catch {
    return null;
  }
};

const deleteCloudinaryAsset = async (url) => {
  const assetInfo = getCloudinaryAssetInfo(url);
  if (!assetInfo) {
    return false;
  }

  try {
    await cloudinary.uploader.destroy(assetInfo.publicId, {
      resource_type: assetInfo.resourceType
    });
    return true;
  } catch (error) {
    console.warn(`Cloudinary cleanup failed for ${assetInfo.publicId}:`, error.message);
    return false;
  }
};

const deleteCloudinaryAssets = async (urls = []) =>
  Promise.all(urls.filter(Boolean).map((url) => deleteCloudinaryAsset(url)));

const buildCloudinaryAttachmentUrl = (url, downloadName) => {
  if (!isCloudinaryUrl(url)) {
    return url;
  }

  const safeName = sanitizeDownloadName(downloadName);
  const attachmentToken = safeName ? `fl_attachment:${safeName}` : "fl_attachment";
  return url.includes("/upload/") ? url.replace("/upload/", `/upload/${attachmentToken}/`) : url;
};

const buildCloudinaryPdfPreviewUrl = (url) => {
  if (!isCloudinaryUrl(url) || !/\.pdf(\?|$)/i.test(url)) {
    return url;
  }

  const imageUrl = url.replace("/raw/upload/", "/image/upload/");
  return imageUrl.replace("/upload/", "/upload/pg_1/").replace(/\.pdf(\?|$)/i, ".jpg$1");
};

const buildCloudinaryDownloadUrl = (url) => {
  const assetInfo = getCloudinaryAssetInfo(url);
  if (!assetInfo) {
    return null;
  }

  return cloudinary.url(assetInfo.publicId, {
    resource_type: assetInfo.resourceType,
    type: "upload",
    version: assetInfo.version,
    flags: "attachment"
  });
};

module.exports = {
  buildCloudinaryAttachmentUrl,
  buildCloudinaryDownloadUrl,
  buildCloudinaryPdfPreviewUrl,
  deleteCloudinaryAsset,
  deleteCloudinaryAssets,
  getCloudinaryAssetInfo,
  isCloudinaryUrl,
  uploadBufferToCloudinary
};
