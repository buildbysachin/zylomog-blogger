const asyncHandler = require("express-async-handler");
const imagekit = require("../config/imagekit");
const ApiError = require("../utils/ApiError");

// @desc    Get signed auth params for CLIENT-SIDE ImageKit uploads
//          (recommended: keeps large files off our own server)
// @route   GET /api/uploads/auth
// @access  Private
const getUploadAuth = asyncHandler(async (req, res) => {
  const authenticationParameters = imagekit.getAuthenticationParameters();
  res.status(200).json({ success: true, data: authenticationParameters });
});

// @desc    Direct SERVER-SIDE upload (fallback for clients that post a file/base64 to us)
// @route   POST /api/uploads
// @access  Private
// Expects multipart/form-data with field "file" (via multer, memoryStorage)
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No file provided");

  const { folder = "zylomog/misc" } = req.body;

  const result = await imagekit.upload({
    file: req.file.buffer, // base64 or binary buffer
    fileName: `${Date.now()}-${req.file.originalname}`,
    folder,
    useUniqueFileName: true,
  });

  res.status(201).json({
    success: true,
    data: { url: result.url, fileId: result.fileId },
  });
});

// @desc    Delete an ImageKit file by fileId (used when replacing thumbnails/avatars)
// @route   DELETE /api/uploads/:fileId
// @access  Private
const deleteFile = asyncHandler(async (req, res) => {
  await imagekit.deleteFile(req.params.fileId);
  res.status(200).json({ success: true, message: "File deleted" });
});

module.exports = { getUploadAuth, uploadFile, deleteFile };
