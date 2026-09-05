export interface AvatarOrImage {
  url: string;
  fileId: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  bio?: string;
  avatar?: AvatarOrImage;
  isActive: boolean;
  createdAt: string;
}

export interface Comment {
  _id: string;
  user: Pick<User, "_id" | "name" | "avatar">;
  text: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  thumbnail: AvatarOrImage;
  author: Pick<User, "_id" | "name" | "avatar" | "bio">;
  published: boolean;
  featured: boolean;
  views: number;
  likes: string[];
  comments: Comment[];
  readTimeMinutes: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SiteSettings {
  _id: string;
  siteName: string;
  tagline: string;
  logo: AvatarOrImage;
  metaDescription: string;
  socialLinks: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
}

export const CATEGORIES = [
  "Mobile Review",
  "Tech Review",
  "Laptop Review",
  "Gadgets",
  "AI & Software",
  "How-To Guides",
  "Industry News",
] as const;

export type Category = (typeof CATEGORIES)[number];
