import { useState } from "react";
import { ArrowLeft, Images, Loader2, Plus, SquarePen, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

import { useAppStore } from "@/app/store";
import { Button } from "@/components/ui/button";
import { StreamStatusBadge } from "@/features/streams/stream-status-badge";
import { formatNumberFa } from "@/lib/format";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { streams, images, deleteStream } = useAppStore();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    if (!deleteTarget) return;
    setDeleting(true);
    deleteStream(deleteTarget);
    setDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">داشبورد مدیریت جریان ها</h2>
          <p className="text-sm text-muted-foreground">ایجاد، ویرایش و حذف جریان ها از این بخش انجام می شود.</p>
        </div>

        <Button asChild>
          <Link to="/admin/streams/new">
            <Plus className="ml-2 h-4 w-4" />
            ایجاد جریان جدید
          </Link>
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {streams.map((stream) => {
          const count = images.filter((image) => image.streamId === stream.id).length;

          return (
            <div key={stream.id} className="group w-full text-right">
              <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/60">
                <div className="relative aspect-[16/10] overflow-hidden rounded-t-3xl">
                  <img
                    alt={stream.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    src={stream.coverUrl}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute left-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="group/btn relative inline-flex">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/streams/${stream.id}/edit`);
                        }}
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 flex-shrink-0 rounded-xl bg-white/80 text-slate-600 backdrop-blur-sm hover:bg-white hover:text-primary-600"
                      >
                        <SquarePen className="h-4 w-4" />
                      </Button>
                      <span className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-white opacity-0 transition-opacity group-hover/btn:opacity-100">
                        ویرایش
                      </span>
                    </div>
                    <div className="group/btn relative inline-flex">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(stream.id);
                        }}
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 flex-shrink-0 rounded-xl bg-white/80 text-slate-600 backdrop-blur-sm hover:bg-white hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <span className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-white opacity-0 transition-opacity group-hover/btn:opacity-100">
                        حذف
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur-sm">
                      <Images className="h-3.5 w-3.5" />
                      {formatNumberFa(count)} تصویر
                    </span>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <StreamStatusBadge size="sm" status={stream.status} />
                  <h3 className="text-base font-bold leading-relaxed text-slate-800">{stream.name}</h3>

                  <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {stream.conceptDescription || `تعداد تصاویر تولید شده: ${formatNumberFa(count)}`}
                  </p>

                  <div className="flex items-center gap-1 border-t border-slate-100 pt-3 text-sm font-semibold text-primary-500 transition-colors group-hover:text-primary-600">
                    <button
                      type="button"
                      onClick={() => navigate(`/streams/${stream.id}`)}
                      className="flex items-center gap-1"
                    >
                      مشاهده جریان
                      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {deleteTarget !== null &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(4px)" }}
            dir="rtl"
            onMouseDown={(e) => {
              if (!deleting && e.target === e.currentTarget) setDeleteTarget(null);
            }}
          >
            <div
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
              style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
            >
              <div className="p-6">
                <h4 className="mb-3 text-center text-lg font-bold text-slate-800">حذف جریان</h4>
                <p className="mb-6 text-center text-sm leading-relaxed text-slate-600">
                  آیا از حذف این جریان مطمئن هستید؟ تمام تصاویر و نظرات مرتبط با آن نیز حذف خواهند شد. این عمل قابل بازگشت نیست.
                </p>
                <div className="flex flex-row-reverse gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {deleting ? "در حال حذف..." : "حذف جریان"}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(null)}
                    disabled={deleting}
                    className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-70"
                  >
                    انصراف
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
