const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

/**
 * Verifies the JWT stored in the httpOnly cookie ("token").
 * Falls back to Authorization: Bearer <token> for non-browser clients (e.g. mobile apps, Postman).
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authenticated. Please log in.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      throw new ApiError(401, "User no longer exists or is deactivated.");
    }

    req.user = user;
    next();
  } catch (err) {
    throw new ApiError(401, "Invalid or expired session. Please log in again.");
  }
});

/** Restricts a route to admins only. Must run AFTER `protect`. */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    throw new ApiError(403, "Admin access required.");
  }
  next();
};

/**
 * Attaches req.user if a valid token is present, but does not block
 * the request otherwise. Useful for routes like GET /posts/:slug where
 * we want to know who's viewing without requiring login.
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) req.user = user;
    } catch (err) {
      // silently ignore — treat as guest
    }
  }
  next();
});

module.exports = { protect, isAdmin, optionalAuth };
