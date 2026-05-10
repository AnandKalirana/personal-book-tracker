const multer = require('multer');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// Configure multer for memory storage (we'll stream to cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow specific image formats
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid file type. Only JPEG, PNG and WEBP are allowed.', 400), false);
    }
  },
});

/**
 * Handle image upload
 * Route: POST /api/upload
 */
const uploadImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No image file provided', 400));
  }

  const { type } = req.body;
  const folder = type === 'avatar' ? 'book_tracker_avatars' : 'book_tracker_covers';

  try {
    const result = await uploadToCloudinary(req.file.buffer, folder);

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return next(new AppError('Failed to upload image to cloud storage', 500));
  }
});

module.exports = {
  upload,
  uploadImage,
};

