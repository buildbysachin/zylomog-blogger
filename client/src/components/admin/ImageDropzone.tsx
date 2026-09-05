"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadToImageKit } from "@/lib/imagekit";
import type { AvatarOrImage } from "@/types";

export function ImageDropzone({
  value,
  onChange,
  folder = "zylomog/misc",
  label = "Upload image",
  aspect = "aspect-video",
}: {
  value?: AvatarOrImage;
  onChange: (result: AvatarOrImage) => void;
  folder?: string;
  label?: string;
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const result = await uploadToImageKit(file, folder);
      onChange(result);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div
        className={`relative flex ${aspect} w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border bg-secondary/40"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        {value?.url ? (
          <>
            <Image src={value.url} alt="Preview" fill className="rounded-xl object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onChange({ url: "", fileId: "" });
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="h-8 w-8" />
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs">Drag & drop or click to browse (max 5MB)</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
