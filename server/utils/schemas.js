const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  bio: z.string().max(300).optional(),
  avatar: z
    .object({ url: z.string(), fileId: z.string() })
    .optional(),
});

const createPostSchema = z.object({
  title: z.string().min(3).max(150),
  content: z.string().min(20),
  excerpt: z.string().min(10).max(300),
  category: z.enum([
    "Mobile Review",
    "Tech Review",
    "Laptop Review",
    "Gadgets",
    "AI & Software",
    "How-To Guides",
    "Industry News",
  ]),
  tags: z.array(z.string()).optional().default([]),
  thumbnail: z.object({
    url: z.string().url(),
    fileId: z.string(),
  }),
  published: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
});

const updatePostSchema = createPostSchema.partial();

const commentSchema = z.object({
  text: z.string().min(1).max(1000),
});

const siteSettingsSchema = z.object({
  siteName: z.string().min(1).max(80).optional(),
  tagline: z.string().max(150).optional(),
  metaDescription: z.string().max(200).optional(),
  logo: z
    .object({ url: z.string().url(), fileId: z.string() })
    .optional(),
  socialLinks: z
    .object({
      twitter: z.string().url().or(z.literal("")).optional(),
      facebook: z.string().url().or(z.literal("")).optional(),
      instagram: z.string().url().or(z.literal("")).optional(),
      youtube: z.string().url().or(z.literal("")).optional(),
    })
    .optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  createPostSchema,
  updatePostSchema,
  commentSchema,
  siteSettingsSchema,
};
