// در dev مستقیم به بک‌اند وصل می‌شویم (مثل GraphQL) تا از مشکل پروکسی جلوگیری شود.
// در production: اگر frontend و backend روی دامنه‌های متفاوت هستند، حتماً VITE_API_URL را تنظیم کنید.
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:2345" : "");
const mediaPreloadCache = new Map<string, Promise<void>>();

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
    if (res.status === 413) {
      throw new Error("حجم فایل بیش از حد مجاز است. حداکثر حجم مجاز ۱۰ مگابایت می‌باشد.");
    }
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

export function preloadMedia(url: string | null | undefined): Promise<void> {
  const resolvedUrl = resolveMediaUrl(url);
  if (!resolvedUrl) {
    return Promise.resolve();
  }

  const cached = mediaPreloadCache.get(resolvedUrl);
  if (cached) {
    return cached;
  }

  const preloadPromise = new Promise<void>((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.src = resolvedUrl;

    const finish = () => resolve();

    if (image.complete) {
      finish();
      return;
    }

    image.onload = finish;
    image.onerror = finish;
  });

  mediaPreloadCache.set(resolvedUrl, preloadPromise);
  return preloadPromise;
}

export function preloadMediaList(urls: Array<string | null | undefined>): Promise<void> {
  return Promise.allSettled(urls.map((url) => preloadMedia(url))).then(() => undefined);
}
