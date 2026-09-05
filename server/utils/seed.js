/**
 * Run with: npm run seed
 * Creates the initial admin account (from .env) and default site settings
 * if they don't already exist. Safe to run multiple times.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const SiteSettings = require("../models/SiteSettings");

const run = async () => {
  await connectDB();

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    await User.create({
      name: process.env.SEED_ADMIN_NAME || "Zylomog Admin",
      email: adminEmail,
      password: process.env.SEED_ADMIN_PASSWORD,
      role: "admin",
    });
    console.log(`✅ Admin account created: ${adminEmail}`);
  } else {
    console.log("ℹ️  Admin account already exists, skipping.");
  }

  await SiteSettings.getSingleton();
  console.log("✅ Site settings initialized.");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
