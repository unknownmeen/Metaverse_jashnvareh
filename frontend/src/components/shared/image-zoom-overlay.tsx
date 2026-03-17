import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { formatNumberFa } from "@/lib/format";

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
  const overlayControlClassName =
    "absolute z-20 flex items-center justify-center rounded-full border border-white/95 bg-white/92 text-slate-600 shadow-[0_16px_40px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-200 hover:border-white hover:bg-white hover:text-primary-700 hover:shadow-[0_18px_42px_rgba(15,23,42,0.22)]";

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
        className={`${overlayControlClassName} left-4 top-4 h-10 w-10`}
        aria-label="بستن"
      >
        <X className="h-5 w-5" />
      </button>
      {hasNavigation ? (
        <>
          <button
            type="button"
            onClick={onPrevious}
            className={`${overlayControlClassName} right-4 top-1/2 h-12 w-12 -translate-y-1/2`}
            aria-label={prevLabel}
            title={prevLabel}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className={`${overlayControlClassName} left-4 top-1/2 h-12 w-12 -translate-y-1/2`}
            aria-label={nextLabel}
            title={nextLabel}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="absolute bottom-4 right-1/2 z-20 translate-x-1/2 rounded-full border border-white/70 bg-white/82 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_16px_40px_rgba(15,23,42,0.16)] backdrop-blur-xl">
            {formatNumberFa(currentIndex + 1)} / {formatNumberFa(totalCount)}
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
