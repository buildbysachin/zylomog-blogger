"use client";

import { useEffect, useState } from "react";
import { FileText, Eye, Users as UsersIcon, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0, views: 0, users: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [allPosts, publishedPosts, users] = await Promise.all([
          api.get("/posts/admin/all", { params: { limit: 1000 } }),
          api.get("/posts", { params: { limit: 1000 } }),
          api.get("/users", { params: { limit: 1000 } }),
        ]);
        const totalViews = publishedPosts.data.data.reduce((sum: number, p: any) => sum + p.views, 0);
        setStats({
          total: allPosts.data.pagination.total,
          published: publishedPosts.data.pagination.total,
          drafts: allPosts.data.pagination.total - publishedPosts.data.pagination.total,
          views: totalViews,
          users: users.data.pagination.total,
        });
      } catch {
        // fail silently — cards just show zeros
      }
    })();
  }, []);

  const cards = [
    { label: "Total Posts", value: stats.total, icon: FileText },
    { label: "Published", value: stats.published, icon: CheckCircle2 },
    { label: "Total Views", value: stats.views, icon: Eye },
    { label: "Registered Users", value: stats.users, icon: UsersIcon },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
