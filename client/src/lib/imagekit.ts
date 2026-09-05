import api from "./api";

export interface UploadResult {
  url: string;
  fileId: string;
}

/**
 * Uploads a file directly from the browser to ImageKit using a signature
 * fetched from our backend (/api/uploads/auth). This keeps large files off
 * our own server and is the recommended ImageKit flow for client uploads.
 */
export async function uploadToImageKit(
  file: File,
  folder = "zylomog/misc"
): Promise<UploadResult> {
  const { data } = await api.get("/uploads/auth");
  const { signature, expire, token } = data.data;

  const form = new FormData();
  form.append("file", file);
  form.append("fileName", `${Date.now()}-${file.name}`);
  form.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY as string);
  form.append("signature", signature);
  form.append("expire", expire);
  form.append("token", token);
  form.append("folder", folder);
  form.append("useUniqueFileName", "true");

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Image upload failed");
  }

  const result = await res.json();
  return { url: result.url, fileId: result.fileId };
}
