const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const imagekit = require("../config/imagekit");

// @desc    Update own profile (name, bio, avatar)
// @route   PUT /api/users/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const { name, bio, avatar } = req.body;
  const user = await User.findById(req.user._id);

  if (avatar?.fileId && user.avatar?.fileId && avatar.fileId !== user.avatar.fileId) {
    imagekit.deleteFile(user.avatar.fileId).catch(() => {});
  }

  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();
  res.status(200).json({ success: true, data: user });
});

// @desc    List all users (admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find().sort("-createdAt").skip(skip).limit(Number(limit)),
    User.countDocuments(),
  ]);
  res.status(200).json({
    success: true,
    data: users,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
  });
});

// @desc    Update a user's role or active status (admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUserByAdmin = asyncHandler(async (req, res) => {
  const { role, isActive } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  await user.save();

  res.status(200).json({ success: true, data: user });
});

// @desc    Delete a user (admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  if (user.avatar?.fileId) imagekit.deleteFile(user.avatar.fileId).catch(() => {});
  await user.deleteOne();

  res.status(200).json({ success: true, message: "User deleted" });
});

module.exports = { updateMe, getUsers, updateUserByAdmin, deleteUser };
