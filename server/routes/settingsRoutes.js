const express = require("express");
const { getSettings, updateSettings } = require("../controllers/siteSettingsController");
const { protect, isAdmin } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { siteSettingsSchema } = require("../utils/schemas");

const router = express.Router();

router.get("/", getSettings);
router.put("/", protect, isAdmin, validate(siteSettingsSchema), updateSettings);

module.exports = router;
