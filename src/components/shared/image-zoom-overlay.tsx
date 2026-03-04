import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ImageZoomOverlayProps {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
}

export function ImageZoomOverlay({ src, alt, open, onClose }: ImageZoomOverlayProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const overlay = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="بزرگنمایی تصویر"
    >
      {/* پس‌زمینه بلور ملایم */}
      <div
        className="absolute inset-0 bg-white/30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* دکمه بستن — شناور روی تصویر */}
      <button
        type="button"
        onClick={onClose}
        className="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-700/80 text-white backdrop-blur-sm transition-colors hover:bg-slate-800"
        aria-label="بستن"
      >
        <X className="h-5 w-5" />
      </button>
      {/* تصویر در حداکثر سایز ممکن — مثل پریویو */}
      <img
        alt={alt}
        className="relative z-10 max-h-[95vh] max-w-[95vw] object-contain"
        src={src}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );

  return createPortal(overlay, document.body);
}
