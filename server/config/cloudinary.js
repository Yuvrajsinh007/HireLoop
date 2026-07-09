const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer memoryStorage
 * @param {string} folder - Cloudinary folder name
 * @param {string} resourceType - 'image' or 'raw' (for PDFs)
 * @returns {Object} Cloudinary upload result
 */
const uploadToCloudinary = (fileBuffer, folder = "hireloop", resourceType = "image") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        transformation:
          resourceType === "image"
            ? [{ width: 800, crop: "limit" }, { quality: "auto" }]
            : undefined,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Cloudinary public_id of the file
 * @param {string} resourceType - 'image' or 'raw'
 */
const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  return await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
};

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary };