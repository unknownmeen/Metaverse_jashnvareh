import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ImageZoomOverlayProps {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  currentIndex?: number;
  totalCount?: number;
  prevLabel?: string;
  nextLabel?: string;
}

export function ImageZoomOverlay({
  src,
  alt,
  open,
  onClose,
  onPrevious,
  onNext,
  currentIndex = 0,
  totalCount = 1,
  prevLabel = "عکس قبلی",
  nextLabel = "عکس بعدی",
}: ImageZoomOverlayProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "ArrowLeft") {
        onPrevious?.();
      }

      if (e.key === "ArrowRight") {
        onNext?.();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, onNext, onPrevious]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;
  const hasNavigation = totalCount > 1 && onPrevious && onNext;

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
      {hasNavigation ? (
        <>
          <button
            type="button"
            onClick={onPrevious}
            className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-slate-700/80 text-white backdrop-blur-sm transition-colors hover:bg-slate-800"
            aria-label={prevLabel}
            title={prevLabel}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-slate-700/80 text-white backdrop-blur-sm transition-colors hover:bg-slate-800"
            aria-label={nextLabel}
            title={nextLabel}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="absolute bottom-4 right-1/2 z-20 translate-x-1/2 rounded-full bg-slate-700/80 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
            {currentIndex + 1} / {totalCount}
          </div>
        </>
      ) : null}
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
