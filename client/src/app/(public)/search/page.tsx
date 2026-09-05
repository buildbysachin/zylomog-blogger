"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/blog/SearchBar";
import { PostCard } from "@/components/blog/PostCard";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { CATEGORIES } from "@/types";
import type { Post } from "@/types";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const [category, setCategory] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get("/posts", { params: { search: search || undefined, category: category || undefined, limit: 20 } })
      .then(({ data }) => setPosts(data.data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-3xl font-extrabold">Search Articles</h1>
      <div className="mx-auto mb-8 max-w-xl">
        <SearchBar />
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <Badge
          variant={category === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setCategory(null)}
        >
          All
        </Badge>
        {CATEGORIES.map((cat) => (
          <Badge
            key={cat}
            variant={category === cat ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setCategory(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">Searching...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-muted-foreground">No articles found. Try a different search.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
