// در dev مستقیم به بک‌اند وصل می‌شویم (مثل GraphQL) تا از مشکل پروکسی جلوگیری شود.
// در production: اگر frontend و backend روی دامنه‌های متفاوت هستند، حتماً VITE_API_URL را تنظیم کنید.
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:2345" : "");

/**
 * Upload a file to the server via multipart/form-data.
 * Returns the public URL of the uploaded file.
 */
export async function uploadFile(file: File, folder: string = "images"): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("auth_token");
  const url = `${API_BASE}/upload?folder=${encodeURIComponent(folder)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      authorization: token ? `Bearer ${token}` : "",
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Upload failed: ${res.status}`);
  }

  const data = await res.json();
  if (!data?.url) {
    throw new Error("پاسخ سرور نامعتبر است");
  }

  return data.url;
}

/**
 * Resolves a media URL for display. In dev, relative URLs need the backend origin.
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/") && API_BASE) return `${API_BASE}${url}`;
  return url;
}
