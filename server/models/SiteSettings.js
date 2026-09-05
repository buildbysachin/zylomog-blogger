const mongoose = require("mongoose");

/**
 * Singleton document — there is only ever one SiteSettings row.
 * Use SiteSettings.getSingleton() to fetch-or-create it.
 */
const SiteSettingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: "Zylomog" },
    tagline: { type: String, default: "Tech News, Reviews & Deep Dives" },
    logo: {
      url: { type: String, default: "" },
      fileId: { type: String, default: "" },
    },
    favicon: {
      url: { type: String, default: "" },
      fileId: { type: String, default: "" },
    },
    metaDescription: {
      type: String,
      default: "Zylomog — the latest mobile and tech reviews, guides, and industry news.",
    },
    socialLinks: {
      twitter: { type: String, default: "" },
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

SiteSettingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model("SiteSettings", SiteSettingsSchema);
