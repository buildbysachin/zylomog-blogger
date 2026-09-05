import Link from "next/link";
import Image from "next/image";
import { ArrowRight, TrendingUp, Eye, Clock } from "lucide-react";
import { PostCard } from "@/components/blog/PostCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import type { Post } from "@/types";
import { CATEGORIES } from "@/types";

async function getHomeData() {
  const [featuredRes, latestRes, trendingRes] = await Promise.all([
    api.get("/posts", { params: { featured: true, limit: 1 } }).catch(() => null),
    api.get("/posts", { params: { limit: 9 } }).catch(() => null),
    api.get("/posts/trending", { params: { limit: 5 } }).catch(() => null),
  ]);

  return {
    hero: featuredRes?.data?.data?.[0] as Post | undefined,
    latest: (latestRes?.data?.data || []) as Post[],
    trending: (trendingRes?.data?.data || []) as Post[],
  };
}

export default async function HomePage() {
  const { hero, latest, trending } = await getHomeData();

  return (
    <div className="container py-10">
      {/* Hero */}
      {hero && (
        <Link href={`/blog/${hero.slug}`} className="group relative mb-14 block overflow-hidden rounded-2xl">
          <div className="relative aspect-[16/7] w-full">
            <Image src={hero.thumbnail.url} alt={hero.title} fill priority className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <Badge variant="accent" className="mb-3">{hero.category}</Badge>
            <h1 className="max-w-3xl text-2xl font-extrabold leading-tight text-white md:text-4xl">
              {hero.title}
            </h1>
            <p className="mt-3 hidden max-w-2xl text-white/80 md:block">{hero.excerpt}</p>
            <div className="mt-4 flex items-center gap-4 text-sm text-white/70">
              <span>{hero.author?.name}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {hero.readTimeMinutes} min read</span>
              <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {hero.views} views</span>
            </div>
          </div>
        </Link>
      )}

      {/* Category quick filters */}
      <div className="mb-10 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Link key={cat} href={`/category/${encodeURIComponent(cat)}`}>
            <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
              {cat}
            </Badge>
          </Link>
        ))}
      </div>

      <div className="grid gap-12 lg:grid-cols-3">
        {/* Latest posts */}
        <div className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Latest Articles</h2>
            <Link href="/search" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {latest.length === 0 ? (
            <p className="text-muted-foreground">No published posts yet. Check back soon!</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {latest.map((post, i) => (
                <PostCard key={post._id} post={post} priority={i < 2} />
              ))}
            </div>
          )}
        </div>

        {/* Trending sidebar */}
        <div>
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            <h2 className="text-2xl font-bold">Trending Now</h2>
          </div>
          <div className="space-y-4">
            {trending.map((post, i) => (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                className="flex gap-4 rounded-lg p-2 transition-colors hover:bg-secondary"
              >
                <span className="text-2xl font-black text-muted-foreground/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-sm font-semibold">{post.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{post.views} views</p>
                </div>
              </Link>
            ))}
            {trending.length === 0 && (
              <p className="text-sm text-muted-foreground">Trending posts will show up here.</p>
            )}
          </div>
          <Button asChild className="mt-6 w-full" variant="secondary">
            <Link href="/category/Mobile%20Review">Top Mobile Reviews</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const revalidate = 60;
