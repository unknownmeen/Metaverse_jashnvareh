import { ArrowLeft, Images, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client/react";

import { Alert } from "@/components/ui/alert";
import { GET_FESTIVALS_QUERY } from "@/graphql/operations";
import { formatNumberFa } from "@/lib/format";
import { t } from "@/lib/i18n";
import { resolveMediaUrl } from "@/lib/upload";
import type { Festival } from "@/types/models";

export function StreamsPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery<{ festivals: Festival[] }>(GET_FESTIVALS_QUERY);

  const festivals = data?.festivals ?? [];

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-800">{t("streams.list_title")}</h2>
        <p className="text-sm text-muted-foreground">{t("streams.list_desc")}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : error ? (
        <Alert variant="error">{t("streams.load_error")}</Alert>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {festivals.map((festival) => (
            <button
              key={festival.id}
              type="button"
              onClick={() => navigate(`/streams/${festival.id}`)}
              className="group w-full text-right"
            >
              <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/60">
                <div className="relative aspect-[16/10] overflow-hidden rounded-t-3xl">
                  <img
                    alt={festival.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    src={resolveMediaUrl(festival.coverImageUrl)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur-sm">
                      <Images className="h-3.5 w-3.5" />
                      {formatNumberFa(festival.imageCount)} {t("home.image_label")}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <h3 className="text-base font-bold text-slate-800 leading-relaxed">{festival.name}</h3>

                  <p className="text-xs leading-5 text-muted-foreground line-clamp-2">
                    {festival.conceptText || t("streams.images_in_stream", { count: festival.imageCount })}
                  </p>

                  <div className="flex items-center gap-1 border-t border-slate-100 pt-3 text-sm font-semibold text-primary-500 transition-colors group-hover:text-primary-600">
                    {t("streams.view_info")}
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
