const ImageKit = require("imagekit");

/**
 * Single shared ImageKit instance used across the app for:
 *  - Generating client-side upload auth signatures (/api/uploads/auth)
 *  - Server-side uploads (avatars, thumbnails, logo)
 *  - Deleting stale files when a new upload replaces an old one
 */
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

module.exports = imagekit;
