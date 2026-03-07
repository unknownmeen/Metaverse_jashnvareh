import { ArrowLeft, MessageCircle, Star } from "lucide-react";
import { Link } from "react-router-dom";

import { formatDateFa, formatNumberFa } from "@/lib/format";
import { t } from "@/lib/i18n";
import { resolveMediaUrl } from "@/lib/upload";
import type { ImageItem } from "@/types/models";

interface ImageCardProps {
  image: ImageItem;
  subtitle?: string;
}

export function ImageCard({ image, subtitle }: ImageCardProps) {
  const averageRating = image.averageRating ?? 0;
  const commentCount = image.commentCount ?? 0;

  return (
    <Link
      to={`/images/${image.id}`}
      className="group block h-full w-full text-right outline-none focus:outline-none focus:ring-0"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/60 hover:border-slate-100">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-3xl bg-slate-100">
          <img
            alt={image.title ?? ""}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            src={resolveMediaUrl(image.url)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
            <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur-sm">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              {formatNumberFa(Number(averageRating.toFixed(1)))}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur-sm">
              <MessageCircle className="h-3.5 w-3.5" />
              {formatNumberFa(commentCount)}
            </span>
          </div>
        </div>

        <div className="space-y-2 p-4">
          <h3 className="text-base font-bold leading-relaxed text-slate-800">{image.title}</h3>
          {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
          <p className="text-xs text-muted-foreground">{formatDateFa(image.createdAt)}</p>

          <div className="flex items-center gap-1 border-t border-slate-100 pt-3 text-sm font-semibold text-primary-500 transition-colors group-hover:text-primary-600">
            {t("image_card.view_details")}
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}
