import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "@/components/blog/PostCard";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { CommentsSection } from "@/components/blog/CommentsSection";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/types";

async function getPost(slug: string): Promise<{ post: Post; related: Post[] } | null> {
  try {
    const { data } = await api.get(`/posts/${slug}`);
    return { post: data.data, related: data.related || [] };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const result = await getPost(params.slug);
  if (!result) return { title: "Post not found" };
  const { post } = result;

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: [post.thumbnail.url],
      type: "article",
      publishedTime: post.createdAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.thumbnail.url],
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const result = await getPost(params.slug);
  if (!result) return notFound();
  const { post, related } = result;

  const url = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/blog/${post.slug}`;

  return (
    <article className="container py-10">
      <div className="mx-auto max-w-3xl text-center">
        <Badge variant="accent" className="mb-4">{post.category}</Badge>
        <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">{post.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>

        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            {post.author?.avatar?.url ? (
              <Image src={post.author.avatar.url} alt={post.author.name} width={32} height={32} className="rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                {post.author?.name?.[0]}
              </div>
            )}
            <span className="font-medium text-foreground">{post.author?.name}</span>
          </div>
          <span>·</span>
          <span>{formatDate(post.createdAt)}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {post.readTimeMinutes} min</span>
          <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {post.views}</span>
        </div>
      </div>

      <div className="relative mx-auto mt-8 aspect-[16/8] w-full max-w-5xl overflow-hidden rounded-2xl">
        <Image src={post.thumbnail.url} alt={post.title} fill priority className="object-cover" />
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl gap-10 lg:grid-cols-[1fr_260px]">
        <div className="min-w-0">
          <div
            id="post-content"
            className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
            <ShareButtons url={url} title={post.title} />
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">#{tag}</Badge>
              ))}
            </div>
          </div>

          {post.author?.bio && (
            <div className="mt-10 flex gap-4 rounded-xl border border-border bg-card p-6">
              {post.author.avatar?.url ? (
                <Image src={post.author.avatar.url} alt={post.author.name} width={56} height={56} className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary text-lg font-bold">
                  {post.author.name[0]}
                </div>
              )}
              <div>
                <p className="font-semibold">{post.author.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{post.author.bio}</p>
              </div>
            </div>
          )}

          <CommentsSection postId={post._id} initialComments={post.comments} initialLikes={post.likes} />
        </div>

        <TableOfContents />
      </div>

      {related.length > 0 && (
        <div className="mx-auto mt-16 max-w-6xl">
          <h2 className="mb-6 text-2xl font-bold">Related Articles</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <PostCard key={p._id} post={p as Post} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

export const revalidate = 60;
