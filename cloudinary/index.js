// Import the cloudinary library and use its v2 version
const cloudinary = require('cloudinary').v2;

const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure cloudinary with credentials from env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,           
    api_secret: process.env.CLOUDINARY_SECRET      
});

// Set up storage engine for multer using Cloudinary
const storage = new CloudinaryStorage({
    cloudinary, 
    params: {
        folder: 'YelpCamp',
        allowedFormats: ['jpeg', 'png', 'jpg'], 
        transformation: [
            { width: 1920, crop: 'limit' },      
            { quality: 'auto' },                 
            { fetch_format: 'auto' } 
        ]
    }
});

// Export both cloudinary instance and configured storage engine
module.exports = {
    cloudinary,
    storage
}
