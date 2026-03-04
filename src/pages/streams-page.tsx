import { ArrowLeft, Images } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAppStore } from "@/app/store";
import { formatNumberFa } from "@/lib/format";

export function StreamsPage() {
  const navigate = useNavigate();
  const { streams, images } = useAppStore();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-800">لیست جریان ها</h2>
        <p className="text-sm text-muted-foreground">برای مشاهده تصاویر هر جشنواره، روی کارت مورد نظر کلیک کنید.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {streams.map((stream) => {
          const streamImages = images.filter((image) => image.streamId === stream.id);

          return (
            <button
              key={stream.id}
              type="button"
              onClick={() => navigate(`/streams/${stream.id}`)}
              className="group w-full text-right"
            >
              <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/60">
                {/* Cover image with hover overlay */}
                <div className="relative aspect-[16/10] overflow-hidden rounded-t-3xl">
                  <img
                    alt={stream.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    src={stream.coverUrl}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur-sm">
                      <Images className="h-3.5 w-3.5" />
                      {formatNumberFa(streamImages.length)} تصویر
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="space-y-3 p-4">
                  <h3 className="text-base font-bold text-slate-800 leading-relaxed">{stream.name}</h3>

                  <p className="text-xs leading-5 text-muted-foreground line-clamp-2">
                    {stream.conceptDescription || `${formatNumberFa(streamImages.length)} تصویر در این جریان ثبت شده است.`}
                  </p>

                  {/* Footer link */}
                  <div className="flex items-center gap-1 border-t border-slate-100 pt-3 text-sm font-semibold text-primary-500 transition-colors group-hover:text-primary-600">
                    مشاهده اطلاعات جریان
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
