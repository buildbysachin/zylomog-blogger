"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PostForm } from "@/components/admin/PostForm";
import api from "@/lib/api";
import type { Post } from "@/types";

export default function EditPostPage() {
  const params = useParams();
  const id = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/posts/admin/${id}`)
      .then(({ data }) => setPost(data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !post) {
    return <p className="text-destructive">{error || "Post not found."}</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit Post</h1>
      <PostForm post={post} postId={post._id} />
    </div>
  );
}
