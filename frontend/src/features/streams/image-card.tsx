import { ArrowLeft, Loader2, MessageCircle, Star, Trash2 } from "lucide-react";
import { useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client/react";

import { useAppStore } from "@/app/store";
import { Alert } from "@/components/ui/alert";
import { formatDateFa, formatNumberFa } from "@/lib/format";
import { t } from "@/lib/i18n";
import { resolveMediaUrl } from "@/lib/upload";
import { DELETE_IMAGE_MUTATION, GET_FESTIVAL_IMAGES_QUERY, GET_MY_IMAGES_QUERY } from "@/graphql/operations";
import type { ImageItem } from "@/types/models";

interface ImageCardProps {
  image: ImageItem;
  subtitle?: string;
}

export function ImageCard({ image, subtitle }: ImageCardProps) {
  const { currentUser } = useAppStore();
  const [deleteImageMutation, { loading: deletingImage }] = useMutation(DELETE_IMAGE_MUTATION);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const averageRating = image.averageRating ?? 0;
  const judgeAverageRating = image.judgeAverageRating ?? 0;
  const commentCount = image.commentCount ?? 0;
  const galleryCount = image.galleryUrls.length > 0 ? image.galleryUrls.length : 1;
  const canSeeJudgeSignals = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN";
  const canDeleteImage = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN";

  const handleDeleteImage = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (deletingImage) {
      return;
    }

    setDeleteError("");
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    await deleteImageMutation({
      variables: { imageId: image.id },
      refetchQueries: [
        { query: GET_FESTIVAL_IMAGES_QUERY, variables: { festivalId: image.festivalId } },
        { query: GET_MY_IMAGES_QUERY },
      ],
      awaitRefetchQueries: true,
    })
      .then(() => {
        setDeleteDialogOpen(false);
        setDeleteError("");
      })
      .catch((error: unknown) => {
        setDeleteError(error instanceof Error ? error.message : t("image_card.delete_error"));
      });
  };

  return (
    <>
      <Link
        to={`/images/${image.slug}`}
        className="group block h-full w-full text-right outline-none focus:outline-none focus:ring-0"
      >
        <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/60 hover:border-slate-100">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-3xl bg-slate-100">
          {canDeleteImage ? (
            <button
              type="button"
              onClick={(event) => void handleDeleteImage(event)}
              className="absolute left-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/95 bg-white/92 text-slate-500 opacity-0 shadow-[0_12px_30px_rgba(15,23,42,0.14)] backdrop-blur-xl transition-all duration-200 hover:border-white hover:bg-white hover:text-red-600 group-hover:opacity-100"
              title={t("image_card.delete_image")}
            >
              {deletingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          ) : null}
          <img
            alt={image.title ?? ""}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            src={resolveMediaUrl(image.url)}
          />
          {galleryCount > 1 ? (
            <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              {formatNumberFa(galleryCount)} عکس
            </span>
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
            <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur-sm">
              <MessageCircle className="h-3.5 w-3.5" />
              {formatNumberFa(commentCount)}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur-sm">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              {formatNumberFa(Number(averageRating.toFixed(1)))}
            </span>
            {canSeeJudgeSignals ? (
              <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-violet-700 backdrop-blur-sm">
                <Star className="h-3.5 w-3.5 fill-violet-500 text-violet-500" />
                {formatNumberFa(Number(judgeAverageRating.toFixed(1)))}
              </span>
            ) : null}
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
      {deleteDialogOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(4px)" }}
            dir="rtl"
            onMouseDown={(event) => {
              if (!deletingImage && event.target === event.currentTarget) {
                setDeleteDialogOpen(false);
                setDeleteError("");
              }
            }}
          >
            <div
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
              style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
            >
              <div className="p-6">
                <h4 className="mb-3 text-center text-lg font-bold text-slate-800">{t("image_card.delete_confirm_title")}</h4>
                <p className="mb-6 text-center text-sm leading-relaxed text-slate-600">{t("image_card.delete_confirm")}</p>
                {deleteError ? (
                  <Alert variant="error" className="mb-4">
                    {deleteError}
                  </Alert>
                ) : null}
                <div className="flex flex-row-reverse gap-3">
                  <button
                    onClick={() => void handleConfirmDelete()}
                    disabled={deletingImage}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {deletingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {deletingImage ? t("image_card.deleting") : t("image_card.delete_action")}
                  </button>
                  <button
                    onClick={() => {
                      setDeleteDialogOpen(false);
                      setDeleteError("");
                    }}
                    disabled={deletingImage}
                    className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-70"
                  >
                    {t("common.close")}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
