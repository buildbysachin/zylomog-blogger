import Link from "next/link";
import Image from "next/image";
import { Eye, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/types";

export function PostCard({ post, priority = false }: { post: Post; priority?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          <Image
            src={post.thumbnail.url}
            alt={post.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Badge className="absolute left-3 top-3" variant="accent">
            {post.category}
          </Badge>
        </div>
        <div className="p-5">
          <h3 className="line-clamp-2 text-lg font-bold leading-snug group-hover:text-primary">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>{post.author?.name}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {post.readTimeMinutes} min
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> {post.views}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
