import { PostCard } from "@/components/blog/PostCard";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { CATEGORIES } from "@/types";
import type { Post } from "@/types";
import Link from "next/link";
import type { Metadata } from "next";

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const category = decodeURIComponent(params.category);
  return {
    title: `${category} Articles`,
    description: `Browse all ${category} articles, reviews, and guides on Zylomog.`,
  };
}

async function getCategoryPosts(category: string, page: number) {
  try {
    const { data } = await api.get("/posts", { params: { category, page, limit: 12 } });
    return data;
  } catch {
    return { data: [], pagination: { totalPages: 1, page: 1 } };
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams: { page?: string };
}) {
  const category = decodeURIComponent(params.category);
  const page = Number(searchParams.page) || 1;
  const { data: posts, pagination } = await getCategoryPosts(category, page);

  return (
    <div className="container py-10">
      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Link key={cat} href={`/category/${encodeURIComponent(cat)}`}>
            <Badge variant={cat === category ? "default" : "outline"} className="cursor-pointer">
              {cat}
            </Badge>
          </Link>
        ))}
      </div>

      <h1 className="mb-8 text-3xl font-extrabold">{category}</h1>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">No articles published in this category yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: Post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/category/${encodeURIComponent(category)}?page=${p}`}
              className={`flex h-9 w-9 items-center justify-center rounded-md text-sm ${
                p === page ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export const revalidate = 60;
