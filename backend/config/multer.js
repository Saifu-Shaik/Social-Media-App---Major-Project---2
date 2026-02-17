const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

// Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "socialmedia_uploads",
      resource_type: "image",
      format: file.mimetype.split("/")[1], // keeps original extension
      public_id: Date.now() + "-" + Math.round(Math.random() * 1e9),
    };
  },
});

// File filter (kept from your code)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("❌ Only image files are allowed"), false);
  }
};

// Multer config
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter,
});

module.exports = upload;
