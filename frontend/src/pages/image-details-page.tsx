import { type FormEvent, useEffect, useState } from "react";
import { Award, Loader2, Maximize2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client/react";

import { ImageZoomOverlay } from "@/components/shared/image-zoom-overlay";
import { useAppStore } from "@/app/store";
import { Alert } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/features/comments/star-rating";
import { formatDateFa, formatNumberFa, formatTimeFa } from "@/lib/format";
import { t } from "@/lib/i18n";
import { resolveMediaUrl } from "@/lib/upload";
import {
  GET_IMAGE_QUERY,
  GET_IMAGE_COMMENTS_QUERY,
  ADD_COMMENT_MUTATION,
  ADD_ADMIN_REVIEW_MUTATION,
  RATE_IMAGE_MUTATION,
  TOGGLE_TOP_IMAGE_MUTATION,
} from "@/graphql/operations";
import type { ImageItem, Comment } from "@/types/models";

export function ImageDetailsPage() {
  const navigate = useNavigate();
  const { imageId } = useParams();
  const { currentUser } = useAppStore();

  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [zoomOpen, setZoomOpen] = useState(false);

  const { data: imageData, loading: imageLoading } = useQuery<{ image: ImageItem }>(GET_IMAGE_QUERY, {
    variables: { idOrSlug: imageId },
    skip: !imageId,
  });

  const image = imageData?.image;

  const { data: commentsData } = useQuery<{ imageComments: Comment[] }>(GET_IMAGE_COMMENTS_QUERY, {
    variables: { imageId: image?.id },
    skip: !image?.id,
  });

  const [addComment, { loading: commenting }] = useMutation(ADD_COMMENT_MUTATION);

  const [addAdminReview] = useMutation(ADD_ADMIN_REVIEW_MUTATION);

  const [rateImage] = useMutation(RATE_IMAGE_MUTATION);

  // ریدایرکت از UUID به slug فارسی در آدرس
  const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
  useEffect(() => {
    if (image?.slug && imageId && isUuid(imageId) && imageId !== image.slug) {
      navigate(`/images/${image.slug}`, { replace: true });
    }
  }, [image?.slug, imageId, navigate]);

  const [toggleTopImage] = useMutation(TOGGLE_TOP_IMAGE_MUTATION);

  if (imageLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const isAdminStyleComment = (c: Comment) =>
    c.isAdminReview || c.author?.role === "ADMIN" || c.author?.role === "SUPER_ADMIN";

  const imageComments = [...(commentsData?.imageComments ?? [])].sort((a, b) => {
    const aAdmin = isAdminStyleComment(a);
    const bAdmin = isAdminStyleComment(b);
    if (aAdmin && !bAdmin) return -1;
    if (!aAdmin && bAdmin) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (!currentUser || !image) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>{t("image_details.not_found")}</p>
        </CardContent>
      </Card>
    );
  }

  const averageRating = image.averageRating ?? 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (rating === 0 || text.trim().length < 5) {
      setError(t("image_details.comment_validation"));
      return;
    }

    try {
      const refetchQueries = [
        { query: GET_IMAGE_COMMENTS_QUERY, variables: { imageId: image.id } },
        { query: GET_IMAGE_QUERY, variables: { idOrSlug: image.slug ?? image.id } },
      ];
      await rateImage({ variables: { input: { imageId: image.id, score: rating } }, refetchQueries });

      if (currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN") {
        await addAdminReview({
          variables: { input: { imageId: image.id, text: text.trim() } },
          refetchQueries: [{ query: GET_IMAGE_COMMENTS_QUERY, variables: { imageId: image.id } }],
        });
      } else {
        await addComment({
          variables: { input: { imageId: image.id, text: text.trim() } },
          refetchQueries,
        });
      }

      setRating(0);
      setText("");
      setError("");
    } catch {
      setError(t("image_details.comment_error"));
    }
  };

  const handleToggleFeatured = async () => {
    await toggleTopImage({
      variables: { imageId: image.id },
      optimisticResponse: {
        toggleTopImage: { ...image, isTopImage: !image.isTopImage },
      },
    });
  };

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[1.3fr,1fr]">
      <Card className="overflow-hidden border-white/70" data-section="image" data-image-id={image.id}>
        <div className="relative w-full overflow-hidden rounded-t-2xl bg-slate-100">
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            className="absolute left-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-slate-600 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:text-primary-600"
            title={t("image_details.zoom")}
          >
            <Maximize2 className="h-5 w-5" />
          </button>
          {(currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN") && (
            <button
              type="button"
              onClick={handleToggleFeatured}
              className={`absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold shadow-lg transition-all backdrop-blur-sm ${
                image.isTopImage
                  ? "bg-amber-400 text-amber-900 hover:bg-amber-500"
                  : "bg-white/80 text-slate-600 hover:bg-white hover:text-amber-700"
              }`}
              title={image.isTopImage ? t("image_details.remove_featured") : t("image_details.set_featured")}
            >
              <Award className="h-4 w-4" />
              {image.isTopImage ? t("image_details.admin_featured") : t("image_details.set_featured")}
            </button>
          )}
          <img alt={image.title ?? ""} className="max-h-[70vh] w-full object-contain" src={resolveMediaUrl(image.url)} />
        </div>
        <ImageZoomOverlay
          alt={image.title ?? ""}
          onClose={() => setZoomOpen(false)}
          open={zoomOpen}
          src={resolveMediaUrl(image.url)}
        />
        <CardContent className="space-y-2 p-5">
          <h2 className="text-xl font-bold text-slate-800">{image.title}</h2>
          <p className="text-sm text-muted-foreground">
            {t("image_details.owner")}: {image.author?.visibleName ?? image.author?.realName ?? t("image_details.unknown")}
          </p>
          <p className="text-sm text-muted-foreground">{t("image_details.registered_date")}: {formatDateFa(image.createdAt)}</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="border-white/70" data-section="comments" data-image-id={image.id}>
          <CardHeader>
            <CardTitle>{t("image_details.comments_title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {imageComments.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("image_details.no_comments")}</p>
            ) : (
              imageComments.map((comment) => {
                const isAdminStyle = isAdminStyleComment(comment);
                const reviewLabel =
                  isAdminStyle && comment.author?.role === "SUPER_ADMIN"
                    ? ` ${t("image_details.super_admin_review")}`
                    : isAdminStyle
                      ? ` ${t("image_details.admin_review")}`
                      : "";
                return (
                <div
                  className={`rounded-2xl border p-3 ${
                    isAdminStyle ? "border-amber-200 bg-amber-50/70" : "border-border bg-white"
                  }`}
                  key={comment.id}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={resolveMediaUrl(comment.author?.avatarUrl)} alt={comment.author?.realName ?? t("image_details.user")} />
                      <AvatarFallback>{t("image_details.user")}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">
                        {comment.author?.visibleName ?? comment.author?.realName ?? t("image_details.deleted_user")}
                        {reviewLabel}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateFa(comment.createdAt)} | {formatTimeFa(comment.createdAt)}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm leading-6 text-slate-700">{comment.text}</p>
                </div>
              );
              })
            )}
          </CardContent>
        </Card>

        <Card className="border-white/70" data-section="rate-comment" data-image-id={image.id}>
          <CardHeader>
            <CardTitle>{t("image_details.rate_comment_title")}</CardTitle>
            <CardDescription>
              {t("image_details.avg_rating")}: {formatNumberFa(Number(averageRating.toFixed(1)))} {t("image_details.of_5")} - {formatNumberFa(image.commentCount)} {t("image_details.comments_count")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentUser.role === "JUDGE" ? (
              <p className="rounded-2xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {t("image_details.judge_readonly")}
              </p>
            ) : image.userId === currentUser.id ? (
              <p className="rounded-2xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {t("image_details.cannot_comment_own_work")}
              </p>
            ) : (
              <form className="space-y-3" onSubmit={handleSubmit} noValidate>
                <StarRating onChange={setRating} value={rating} />
                <Textarea
                  onChange={(event) => setText(event.target.value)}
                  placeholder={t("image_details.comment_placeholder")}
                  value={text}
                />
                {error ? <Alert variant="error">{error}</Alert> : null}
                <Button disabled={commenting} type="submit">
                  {commenting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                  {t("image_details.submit_comment")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
