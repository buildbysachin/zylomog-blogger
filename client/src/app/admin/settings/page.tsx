"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageDropzone } from "@/components/admin/ImageDropzone";
import api from "@/lib/api";
import type { SiteSettings } from "@/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/settings").then(({ data }) => setSettings(data.data));
  }, []);

  if (!settings) return <p className="text-muted-foreground">Loading settings...</p>;

  const update = (key: keyof SiteSettings, value: any) =>
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));

  const updateSocial = (key: string, value: string) =>
    setSettings((prev) => (prev ? { ...prev, socialLinks: { ...prev.socialLinks, [key]: value } } : prev));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const { data } = await api.put("/settings", {
        siteName: settings.siteName,
        tagline: settings.tagline,
        metaDescription: settings.metaDescription,
        logo: settings.logo?.url ? settings.logo : undefined,
        socialLinks: settings.socialLinks,
      });
      setSettings(data.data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Site Settings</h1>

      <div className="space-y-2">
        <Label>Site Logo</Label>
        <div className="w-48">
          <ImageDropzone value={settings.logo} onChange={(result) => update("logo", result)} folder="zylomog/branding" label="Upload logo" aspect="aspect-square" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="siteName">Site Name</Label>
        <Input id="siteName" value={settings.siteName} onChange={(e) => update("siteName", e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tagline">Tagline</Label>
        <Input id="tagline" value={settings.tagline} onChange={(e) => update("tagline", e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="metaDescription">Default Meta Description</Label>
        <Textarea id="metaDescription" value={settings.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} maxLength={200} />
      </div>

      <div className="space-y-4 rounded-lg border border-border p-4">
        <p className="text-sm font-semibold">Social Links</p>
        {(["twitter", "facebook", "instagram", "youtube"] as const).map((key) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="capitalize">{key}</Label>
            <Input
              id={key}
              value={settings.socialLinks?.[key] || ""}
              onChange={(e) => updateSocial(key, e.target.value)}
              placeholder={`https://${key}.com/yourhandle`}
            />
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-accent">Settings saved successfully.</p>}

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
