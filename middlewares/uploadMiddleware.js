const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

// Function to dynamically configure Cloudinary storage based on upload type
const getStorage = (folderName) => {
    return new CloudinaryStorage({
        cloudinary,
        params: async (req, file) => {
            // If the folder is for profile pictures, apply the profile photo transformation
            const transformation = folderName === 'profile_pictures'
            ? [{ width: 500, height: 500, crop: 'thumb', gravity: 'face' }]
            : [];

            return {
                folder: folderName || 'uploads', // Default folder if none specified
                allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'pdf'],
                resource_type: file.mimetype.startsWith('video') ? 'video' : 'image', // Detect type
                transformation: transformation,
                overwrite: true,
            };
        },
    });
};

// Middleware for profile pictures
const uploadProfilePicture = multer({ storage: getStorage('profile_pictures') });

// Middleware for other media uploads (e.g., documents, videos, general images)
const uploadMedia = multer({ 
    storage: multer.memoryStorage(), 
    limits: { fileSize: 1 * 1024 * 1024 } // Limit files to 1MB each
  });
// const uploadMedia = multer({ storage: getStorage('media_uploads') });

module.exports = { uploadProfilePicture, uploadMedia };
