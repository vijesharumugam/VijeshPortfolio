const { v2: cloudinary } = require("cloudinary");

const readCloudinaryEnv = () => ({
  cloudName: (process.env.CLOUDINARY_CLOUD_NAME || "").trim(),
  apiKey: (process.env.CLOUDINARY_API_KEY || "").trim(),
  apiSecret: (process.env.CLOUDINARY_API_SECRET || "").trim()
});

const isCloudinaryConfigured = () =>
  Boolean(Object.values(readCloudinaryEnv()).every(Boolean));

const configureCloudinary = () => {
  if (!isCloudinaryConfigured()) {
    return false;
  }

  const { cloudName, apiKey, apiSecret } = readCloudinaryEnv();

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });

  return true;
};

configureCloudinary();

module.exports = { cloudinary, isCloudinaryConfigured, configureCloudinary };
