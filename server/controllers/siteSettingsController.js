const asyncHandler = require("express-async-handler");
const SiteSettings = require("../models/SiteSettings");
const imagekit = require("../config/imagekit");

// @desc    Get public site settings (logo, name, tagline, socials)
// @route   GET /api/settings
// @access  Public
const getSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSingleton();
  res.status(200).json({ success: true, data: settings });
});

// @desc    Update site settings (logo, name, tagline, meta, socials)
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSingleton();

  const { logo, siteName, tagline, metaDescription, socialLinks } = req.body;

  if (logo?.fileId && settings.logo?.fileId && logo.fileId !== settings.logo.fileId) {
    imagekit.deleteFile(settings.logo.fileId).catch(() => {});
  }

  if (logo !== undefined) settings.logo = logo;
  if (siteName !== undefined) settings.siteName = siteName;
  if (tagline !== undefined) settings.tagline = tagline;
  if (metaDescription !== undefined) settings.metaDescription = metaDescription;
  if (socialLinks !== undefined) settings.socialLinks = { ...settings.socialLinks, ...socialLinks };

  await settings.save();
  res.status(200).json({ success: true, data: settings });
});

module.exports = { getSettings, updateSettings };
