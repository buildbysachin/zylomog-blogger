const mongoose = require("mongoose");
const slugify = require("slugify");

const CommentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    excerpt: {
      type: String,
      maxlength: [300, "Excerpt cannot exceed 300 characters"],
      required: [true, "Excerpt is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Mobile Review",
        "Tech Review",
        "Laptop Review",
        "Gadgets",
        "AI & Software",
        "How-To Guides",
        "Industry News",
      ],
      index: true,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    thumbnail: {
      url: { type: String, required: [true, "Thumbnail is required"] },
      fileId: { type: String, required: true },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [CommentSchema],
    readTimeMinutes: {
      type: Number,
      default: 3,
    },
    metaTitle: { type: String, maxlength: 70 },
    metaDescription: { type: String, maxlength: 160 },
  },
  { timestamps: true }
);

// Full text search index
PostSchema.index({ title: "text", excerpt: "text", tags: "text" });
PostSchema.index({ createdAt: -1 });

// Auto-generate a unique slug from the title
PostSchema.pre("validate", async function (next) {
  if (!this.isModified("title") && this.slug) return next();

  const base = slugify(this.title, { lower: true, strict: true });
  let candidate = base;
  let counter = 1;

  const Post = this.constructor;
  // Ensure uniqueness, excluding this document itself (for updates)
  while (
    await Post.findOne({ slug: candidate, _id: { $ne: this._id } })
  ) {
    candidate = `${base}-${counter++}`;
  }
  this.slug = candidate;

  // Rough read time estimate: 200 words/minute
  const words = this.content ? this.content.split(/\s+/).length : 0;
  this.readTimeMinutes = Math.max(1, Math.ceil(words / 200));

  next();
});

module.exports = mongoose.model("Post", PostSchema);
