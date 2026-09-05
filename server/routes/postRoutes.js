const express = require("express");
const {
  getPosts,
  getTrendingPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  getAllPostsAdmin,
  getPostByIdAdmin,
  toggleLike,
  addComment,
} = require("../controllers/postController");
const { protect, isAdmin } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { createPostSchema, updatePostSchema, commentSchema } = require("../utils/schemas");

const router = express.Router();

// Public
router.get("/", getPosts);
router.get("/trending", getTrendingPosts);

// Admin dashboard routes — must be declared before "/:slug"
router.get("/admin/all", protect, isAdmin, getAllPostsAdmin);
router.get("/admin/:id", protect, isAdmin, getPostByIdAdmin);

router.get("/:slug", getPostBySlug);

// Admin only — create/update/delete
router.post("/", protect, isAdmin, validate(createPostSchema), createPost);
router.put("/:id", protect, isAdmin, validate(updatePostSchema), updatePost);
router.delete("/:id", protect, isAdmin, deletePost);

// Authenticated users — likes & comments
router.post("/:id/like", protect, toggleLike);
router.post("/:id/comments", protect, validate(commentSchema), addComment);

module.exports = router;
