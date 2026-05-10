const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads an image stream to Cloudinary
 * @param {Buffer} buffer - The image buffer to upload
 * @param {String} folder - Cloudinary folder (e.g., 'book_covers' or 'avatars')
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadToCloudinary = (buffer, folder = 'book_tracker') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    // Write the buffer to the stream and end it
    const streamifier = require('streamifier');
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Deletes an image from Cloudinary by its public ID
 * @param {String} publicId - Cloudinary public ID
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

/**
 * Extracts public ID from a Cloudinary URL
 * @param {String} url - Cloudinary image URL
 * @returns {String} - Public ID
 */
const extractPublicId = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  const parts = url.split('/');
  const fileWithExtension = parts[parts.length - 1];
  const folder = parts[parts.length - 2];
  const publicId = fileWithExtension.split('.')[0];
  return `${folder}/${publicId}`;
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
};
