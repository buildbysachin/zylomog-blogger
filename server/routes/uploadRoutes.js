const express = require("express");
const multer = require("multer");
const { getUploadAuth, uploadFile, deleteFile } = require("../controllers/uploadController");
const { protect, isAdmin } = require("../middlewares/auth");

const router = express.Router();

// In-memory storage — file goes straight to ImageKit, never touches disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// Any logged-in user can request a signed upload (avatar) or upload directly
router.get("/auth", protect, getUploadAuth);
router.post("/", protect, upload.single("file"), uploadFile);

// Only admins can delete arbitrary files (thumbnails/logo cleanup)
router.delete("/:fileId", protect, isAdmin, deleteFile);

module.exports = router;
