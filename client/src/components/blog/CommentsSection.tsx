"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Comment } from "@/types";

export function CommentsSection({
  postId,
  initialComments,
  initialLikes,
}: {
  postId: string;
  initialComments: Comment[];
  initialLikes: string[];
}) {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [likes, setLikes] = useState(initialLikes);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const liked = user ? likes.includes(user._id) : false;

  const handleLike = async () => {
    if (!user) return setError("Please sign in to like this post.");
    try {
      const { data } = await api.post(`/posts/${postId}/like`);
      setLikes((prev) =>
        data.liked ? [...prev, user._id] : prev.filter((id) => id !== user._id)
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setError("Please sign in to comment.");
    if (!text.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { text });
      setComments((prev) => [...prev, { ...data.data, user: { _id: user._id, name: user.name, avatar: user.avatar } }]);
      setText("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-14 border-t border-border pt-10">
      <div className="mb-8 flex items-center gap-6">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
        >
          <Heart className={liked ? "h-4 w-4 fill-destructive text-destructive" : "h-4 w-4"} />
          {likes.length} {likes.length === 1 ? "Like" : "Likes"}
        </button>
        <span className="text-sm text-muted-foreground">
          {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
        </span>
      </div>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts..."
            className="min-h-[80px]"
          />
          <Button type="submit" disabled={submitting} size="icon" className="h-auto shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      ) : (
        <p className="mb-8 text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link> to like or comment on this post.
        </p>
      )}

      <div className="space-y-6">
        {comments.map((c) => (
          <div key={c._id} className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
              {c.user?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{c.user?.name}</span>
                <span className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
