const asyncHandler = require("express-async-handler");
const Post = require("../models/Post");
const ApiError = require("../utils/ApiError");
const imagekit = require("../config/imagekit");

// @desc    Get published posts (public feed) with search/filter/pagination
// @route   GET /api/posts?search=&category=&tag=&page=&limit=&sort=
// @access  Public
const getPosts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    tag,
    page = 1,
    limit = 10,
    sort = "-createdAt",
    featured,
  } = req.query;

  const query = { published: true };
  if (category) query.category = category;
  if (tag) query.tags = tag.toLowerCase();
  if (featured === "true") query.featured = true;
  if (search) query.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);

  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate("author", "name avatar")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .select("-comments"),
    Post.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: posts,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

// @desc    Get trending posts (most viewed, published, last 30 days prioritized)
// @route   GET /api/posts/trending
// @access  Public
const getTrendingPosts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 5;
  const posts = await Post.find({ published: true })
    .populate("author", "name avatar")
    .sort("-views -createdAt")
    .limit(limit)
    .select("-comments");
  res.status(200).json({ success: true, data: posts });
});

// @desc    Get single post by slug (increments view count)
// @route   GET /api/posts/:slug
// @access  Public
const getPostBySlug = asyncHandler(async (req, res) => {
  const post = await Post.findOneAndUpdate(
    { slug: req.params.slug, published: true },
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate("author", "name avatar bio")
    .populate("comments.user", "name avatar");

  if (!post) throw new ApiError(404, "Post not found");

  const related = await Post.find({
    _id: { $ne: post._id },
    category: post.category,
    published: true,
  })
    .limit(4)
    .select("title slug thumbnail excerpt createdAt");

  res.status(200).json({ success: true, data: post, related });
});

// @desc    Create a post
// @route   POST /api/posts
// @access  Private/Admin
const createPost = asyncHandler(async (req, res) => {
  const post = await Post.create({ ...req.body, author: req.user._id });
  res.status(201).json({ success: true, data: post });
});

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private/Admin
const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, "Post not found");

  // If thumbnail changed, clean up the old ImageKit file
  if (
    req.body.thumbnail &&
    req.body.thumbnail.fileId &&
    post.thumbnail.fileId &&
    req.body.thumbnail.fileId !== post.thumbnail.fileId
  ) {
    imagekit.deleteFile(post.thumbnail.fileId).catch(() => {});
  }

  Object.assign(post, req.body);
  await post.save();

  res.status(200).json({ success: true, data: post });
});

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private/Admin
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, "Post not found");

  if (post.thumbnail?.fileId) {
    imagekit.deleteFile(post.thumbnail.fileId).catch(() => {});
  }
  await post.deleteOne();

  res.status(200).json({ success: true, message: "Post deleted" });
});

// @desc    Get a single post by its Mongo ID, regardless of published status — used by the admin editor
// @route   GET /api/posts/admin/:id
// @access  Private/Admin
const getPostByIdAdmin = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate("author", "name avatar");
  if (!post) throw new ApiError(404, "Post not found");
  res.status(200).json({ success: true, data: post });
});

// @desc    List ALL posts (drafts + published) — admin dashboard
// @route   GET /api/posts/admin/all
// @access  Private/Admin
const getAllPostsAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 15, status } = req.query;
  const query = {};
  if (status === "published") query.published = true;
  if (status === "draft") query.published = false;

  const skip = (Number(page) - 1) * Number(limit);
  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate("author", "name")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit))
      .select("-comments -content"),
    Post.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: posts,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
  });
});

// @desc    Toggle like on a post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, "Post not found");

  const idx = post.likes.findIndex((u) => u.toString() === req.user._id.toString());
  if (idx > -1) {
    post.likes.splice(idx, 1);
  } else {
    post.likes.push(req.user._id);
  }
  await post.save();

  res.status(200).json({ success: true, likesCount: post.likes.length, liked: idx === -1 });
});

// @desc    Add a comment
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, "Post not found");

  post.comments.push({ user: req.user._id, text: req.body.text });
  await post.save();
  await post.populate("comments.user", "name avatar");

  res.status(201).json({ success: true, data: post.comments[post.comments.length - 1] });
});

module.exports = {
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
};
