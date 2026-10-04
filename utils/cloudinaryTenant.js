const cloudinary = require('cloudinary').v2;

const getCloudinaryOptions = (tenantPrefix) => {
  const normalizedPrefix = tenantPrefix.toUpperCase();
  const cloudName = process.env[`${normalizedPrefix}_CLOUDINARY_CLOUD_NAME`];
  const apiKey = process.env[`${normalizedPrefix}_CLOUDINARY_API_KEY`];
  const apiSecret = process.env[`${normalizedPrefix}_CLOUDINARY_API_SECRET`];

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(`Missing Cloudinary credentials for ${normalizedPrefix}`);
  }

  return {
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  };
};

const uploadBufferToCloudinary = (tenantPrefix, fileBuffer, options = {}, errorMessage = 'Image upload failed') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        ...getCloudinaryOptions(tenantPrefix),
        ...options
      },
      (error, result) => {
        if (error) {
          reject({ message: errorMessage, error });
        } else {
          resolve(result);
        }
      }
    ).end(fileBuffer);
  });
};

const uploadToCloudinary = (tenantPrefix, file, options = {}) => {
  return cloudinary.uploader.upload(file, {
    ...getCloudinaryOptions(tenantPrefix),
    ...options
  });
};

const deleteFromCloudinary = (tenantPrefix, publicId, options = {}) => {
  return cloudinary.uploader.destroy(publicId, {
    ...getCloudinaryOptions(tenantPrefix),
    ...options
  });
};

module.exports = {
  deleteFromCloudinary,
  getCloudinaryOptions,
  uploadBufferToCloudinary,
  uploadToCloudinary
};
