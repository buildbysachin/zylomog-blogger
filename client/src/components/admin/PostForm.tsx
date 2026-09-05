"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ImageDropzone } from "@/components/admin/ImageDropzone";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { CATEGORIES } from "@/types";
import type { AvatarOrImage, Post } from "@/types";
import api from "@/lib/api";

interface FormState {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  thumbnail: AvatarOrImage;
  published: boolean;
  featured: boolean;
  metaTitle: string;
  metaDescription: string;
}

const emptyState: FormState = {
  title: "",
  excerpt: "",
  content: "",
  category: CATEGORIES[0],
  tags: "",
  thumbnail: { url: "", fileId: "" },
  published: false,
  featured: false,
  metaTitle: "",
  metaDescription: "",
};

export function PostForm({ post, postId }: { post?: Post; postId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(
    post
      ? {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          tags: post.tags.join(", "),
          thumbnail: post.thumbnail,
          published: post.published,
          featured: post.featured,
          metaTitle: post.metaTitle || "",
          metaDescription: post.metaDescription || "",
        }
      : emptyState
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (publishOverride?: boolean) => {
    setError("");
    if (!form.title || !form.excerpt || !form.content || !form.thumbnail.url) {
      setError("Title, excerpt, content, and thumbnail are all required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        published: publishOverride ?? form.published,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };

      if (postId) {
        await api.put(`/posts/${postId}`, payload);
      } else {
        await api.post("/posts", payload);
      }
      router.push("/admin/posts");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. iPhone 17 Pro Review: A Real Leap Forward?" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea id="excerpt" value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} placeholder="A short 1-2 sentence summary shown on cards and in search results" maxLength={300} />
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <RichTextEditor content={form.content} onChange={(html) => update("content", html)} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Thumbnail</Label>
            <ImageDropzone
              value={form.thumbnail}
              onChange={(result) => update("thumbnail", result)}
              folder="zylomog/thumbnails"
              label="Upload thumbnail"
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => update("category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="android, flagship, camera" />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="featured" className="cursor-pointer">Featured (hero post)</Label>
            <Switch id="featured" checked={form.featured} onCheckedChange={(v) => update("featured", v)} />
          </div>

          <div className="space-y-3 rounded-lg border border-border p-4">
            <p className="text-sm font-semibold">SEO Metadata</p>
            <div className="space-y-2">
              <Label htmlFor="metaTitle" className="text-xs">Meta Title</Label>
              <Input id="metaTitle" value={form.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} maxLength={70} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDescription" className="text-xs">Meta Description</Label>
              <Textarea id="metaDescription" value={form.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} maxLength={160} />
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3 border-t border-border pt-6">
        <Button variant="outline" disabled={saving} onClick={() => handleSubmit(false)}>
          Save as Draft
        </Button>
        <Button disabled={saving} onClick={() => handleSubmit(true)}>
          {saving ? "Saving..." : "Publish"}
        </Button>
      </div>
    </div>
  );
}
