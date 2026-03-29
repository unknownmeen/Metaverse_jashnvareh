import { type FormEvent, Fragment, useEffect, useState } from "react";
import { Award, ChevronLeft, ChevronRight, Loader2, Maximize2, MessageCircle, Pencil, Reply, Star, Trash2 } from "lucide-react";
import { createPortal } from "react-dom";
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
import { getJudgeMaxScore, isJudgeRole } from "@/lib/roles";
import { preloadMediaList, resolveMediaUrl } from "@/lib/upload";
import {
  GET_IMAGE_QUERY,
  GET_IMAGE_COMMENTS_QUERY,
  ADD_COMMENT_MUTATION,
  ADD_OWNER_REPLY_MUTATION,
  ADD_ADMIN_REVIEW_MUTATION,
  ADD_JUDGE_REVIEW_MUTATION,
  DELETE_COMMENT_MUTATION,
  UPDATE_COMMENT_MUTATION,
  RATE_IMAGE_MUTATION,
  TOGGLE_TOP_IMAGE_MUTATION,
} from "@/graphql/operations";
import type { ImageItem, Comment } from "@/types/models";

function getGraphqlErrorMessage(caught: unknown, fallback: string): string {
  if (caught && typeof caught === "object" && "graphQLErrors" in caught) {
    const errs = (caught as { graphQLErrors?: { message?: string }[] }).graphQLErrors;
    const first = errs?.[0]?.message;
    if (first?.trim()) return first.trim();
  }
  if (caught instanceof Error && caught.message.trim()) return caught.message.trim();
  return fallback;
}

export function ImageDetailsPage() {
  const navigate = useNavigate();
  const { imageId } = useParams();
  const { currentUser } = useAppStore();

  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [zoomOpen, setZoomOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [deleteCommentError, setDeleteCommentError] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [editCommentError, setEditCommentError] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState("");

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

  const [addAdminReview, { loading: adminReviewing }] = useMutation(ADD_ADMIN_REVIEW_MUTATION);

  const [addJudgeReview, { loading: judgeReviewing }] = useMutation(ADD_JUDGE_REVIEW_MUTATION);
  const [deleteCommentMutation, { loading: deletingComment }] = useMutation(DELETE_COMMENT_MUTATION);
  const [updateCommentMutation, { loading: updatingComment }] = useMutation(UPDATE_COMMENT_MUTATION);
  const [addOwnerReply, { loading: replyingOwner }] = useMutation(ADD_OWNER_REPLY_MUTATION);

  const [rateImage] = useMutation(RATE_IMAGE_MUTATION);

  // ریدایرکت از UUID به slug فارسی در آدرس
  const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
  useEffect(() => {
    if (image?.slug && imageId && isUuid(imageId) && imageId !== image.slug) {
      navigate(`/images/${image.slug}`, { replace: true });
    }
  }, [image?.slug, imageId, navigate]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [image?.id]);

  const galleryImages = image?.galleryUrls.length ? image.galleryUrls : image?.url ? [image.url] : [];

  useEffect(() => {
    if (galleryImages.length === 0) return;
    void preloadMediaList(galleryImages);
  }, [galleryImages]);

  const [toggleTopImage] = useMutation(TOGGLE_TOP_IMAGE_MUTATION);

  if (imageLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!currentUser || !image) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>{t("image_details.not_found")}</p>
        </CardContent>
      </Card>
    );
  }

  const isAdminStyleComment = (c: Comment) =>
    c.isAdminReview || c.author?.role === "ADMIN" || c.author?.role === "SUPER_ADMIN";
  const isJudgeStyleComment = (c: Comment) => c.isJudgeReview;
  const canSeeJudgeSignals = currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN";
  const isImageOwner = image.userId === currentUser.id;

  const compareRootComments = (a: Comment, b: Comment) => {
    const aAdmin = isAdminStyleComment(a);
    const bAdmin = isAdminStyleComment(b);
    const aJudge = canSeeJudgeSignals && isJudgeStyleComment(a);
    const bJudge = canSeeJudgeSignals && isJudgeStyleComment(b);
    if (aAdmin && !bAdmin) return -1;
    if (!aAdmin && bAdmin) return 1;
    if (aJudge && !bJudge) return -1;
    if (!aJudge && bJudge) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  };

  const repliesByParentId = new Map<string, Comment[]>();
  const rootComments: Comment[] = [];
  for (const c of commentsData?.imageComments ?? []) {
    if (c.parentCommentId) {
      const list = repliesByParentId.get(c.parentCommentId) ?? [];
      list.push(c);
      repliesByParentId.set(c.parentCommentId, list);
    } else {
      rootComments.push(c);
    }
  }
  rootComments.sort(compareRootComments);
  for (const list of repliesByParentId.values()) {
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  const averageRating = image.averageRating ?? 0;
  const activeImageUrl = galleryImages[activeImageIndex] ?? image.url;
  const hasMultipleImages = galleryImages.length > 1;
  const canManageFestival =
    !image.festival?.creatorId || image.festival.creatorId === currentUser.id;
  const isJudgeUser = isJudgeRole(currentUser.role);
  const judgeMaxScore = getJudgeMaxScore(currentUser.role);
  const judgeAverageRating = image.judgeAverageRating ?? 0;
  const submittingComment = commenting || adminReviewing || judgeReviewing;
  const isPlatformAdmin = currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN";
  const canModifyComment = (c: Comment) => isPlatformAdmin || c.userId === currentUser.id;
  const getRoleLabel = (role?: Comment["author"]["role"]) => (role ? t(`role.${role.toLowerCase()}`) : "");
  const glassControlClassName =
    "absolute z-10 flex items-center justify-center gap-1.5 rounded-full border border-white/90 bg-white/99 px-3 py-2 text-sm font-semibold text-slate-600 shadow-[0_16px_40px_rgba(15,23,42,0.16)] ring-1 ring-white/45 backdrop-blur-xl transition-all duration-200 hover:border-white hover:bg-white hover:text-primary-700 hover:shadow-[0_18px_42px_rgba(15,23,42,0.2)]";
  const glassBadgeClassName =
    "rounded-full border border-white/70 bg-white/76 shadow-[0_16px_40px_rgba(15,23,42,0.14)] ring-1 ring-white/40 backdrop-blur-xl";
  const featuredControlClassName =
    "absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-white/90 bg-white/99 px-4 py-2 text-sm font-semibold text-slate-600 shadow-[0_16px_40px_rgba(15,23,42,0.16)] ring-1 ring-white/45 backdrop-blur-xl transition-all duration-200 hover:border-white hover:bg-white hover:text-amber-700 hover:shadow-[0_18px_42px_rgba(15,23,42,0.2)]";

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

      if (isPlatformAdmin) {
        await addAdminReview({
          variables: { input: { imageId: image.id, text: text.trim() } },
          refetchQueries: [{ query: GET_IMAGE_COMMENTS_QUERY, variables: { imageId: image.id } }],
        });
      } else if (isJudgeUser) {
        await addJudgeReview({
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
    } catch (caught) {
      setError(getGraphqlErrorMessage(caught, t("image_details.comment_error")));
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

  const goToPreviousImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setActiveImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const refetchAfterCommentChange = [
    { query: GET_IMAGE_COMMENTS_QUERY, variables: { imageId: image.id } },
    { query: GET_IMAGE_QUERY, variables: { idOrSlug: image.slug ?? image.id } },
  ];

  const handleConfirmDeleteComment = async () => {
    if (!deleteCommentId) return;
    setDeleteCommentError("");
    try {
      await deleteCommentMutation({
        variables: { commentId: deleteCommentId },
        refetchQueries: refetchAfterCommentChange,
        awaitRefetchQueries: true,
      });
      setDeleteCommentId(null);
      if (editingCommentId === deleteCommentId) {
        setEditingCommentId(null);
        setEditCommentText("");
        setEditCommentError("");
      }
    } catch {
      setDeleteCommentError(t("image_details.delete_comment_error"));
    }
  };

  const startEditComment = (c: Comment) => {
    setEditingCommentId(c.id);
    setEditCommentText(c.text);
    setEditCommentError("");
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentText("");
    setEditCommentError("");
  };

  const handleSaveCommentEdit = async () => {
    if (!editingCommentId) return;
    const trimmed = editCommentText.trim();
    if (trimmed.length < 5) {
      setEditCommentError(t("image_details.comment_edit_validation"));
      return;
    }
    setEditCommentError("");
    try {
      await updateCommentMutation({
        variables: { input: { commentId: editingCommentId, text: trimmed } },
        refetchQueries: refetchAfterCommentChange,
        awaitRefetchQueries: true,
      });
      cancelEditComment();
    } catch {
      setEditCommentError(t("image_details.comment_edit_error"));
    }
  };

  const cancelOwnerReply = () => {
    setReplyToId(null);
    setReplyText("");
    setReplyError("");
  };

  const handleSubmitOwnerReply = async () => {
    if (!replyToId) return;
    const trimmed = replyText.trim();
    if (trimmed.length < 5) {
      setReplyError(t("image_details.reply_validation"));
      return;
    }
    setReplyError("");
    try {
      await addOwnerReply({
        variables: { input: { imageId: image.id, parentCommentId: replyToId, text: trimmed } },
        refetchQueries: refetchAfterCommentChange,
        awaitRefetchQueries: true,
      });
      cancelOwnerReply();
    } catch (caught) {
      setReplyError(getGraphqlErrorMessage(caught, t("image_details.reply_error")));
    }
  };

  const renderCommentCard = (comment: Comment, nested: boolean) => {
    const isAdminStyle = isAdminStyleComment(comment);
    const isJudgeStyle = canSeeJudgeSignals && isJudgeStyleComment(comment);
    const hasRating = Boolean(comment.ratingScore && comment.ratingMaxScore);
    const showCommentActions = canModifyComment(comment);
    const commentControlsPadding = hasRating ? "sm:pl-24" : showCommentActions ? "sm:pl-20" : "";
    const isEditing = editingCommentId === comment.id;
    const isOwnerReply = Boolean(comment.parentCommentId) && comment.userId === image.userId;
    const reviewLabel =
      isAdminStyle && comment.author?.role === "SUPER_ADMIN"
        ? ` ${t("image_details.super_admin_review")}`
        : isAdminStyle
          ? ` ${t("image_details.admin_review")}`
          : isJudgeStyle
            ? ` (${getRoleLabel(comment.author?.role)})`
            : "";
    return (
      <div
        className={`group relative rounded-2xl border p-3 ${
          nested ? "mr-3 border-slate-200/90 bg-slate-50/50" : ""
        } ${isAdminStyle ? "border-amber-200 bg-amber-50/70" : nested ? "" : "border-border bg-white"}`}
      >
        {hasRating ? (
          <div className="mb-2 sm:absolute sm:left-3 sm:top-3 sm:mb-0">
            <div
              className={`inline-flex rounded-full px-1.5 py-0.5 shadow-sm sm:px-2 sm:py-1 ${
                isJudgeStyle ? "bg-violet-50" : "bg-amber-50"
              }`}
            >
              <StarRating
                color={isJudgeStyle ? "purple" : "amber"}
                max={comment.ratingMaxScore!}
                readonly
                size="sm"
                value={comment.ratingScore!}
              />
            </div>
          </div>
        ) : null}
        {showCommentActions && !isEditing ? (
          <div
            className={`absolute left-3 z-[1] flex flex-row items-center gap-1 sm:pointer-events-none sm:opacity-0 sm:group-hover:pointer-events-auto sm:group-hover:opacity-100 ${
              hasRating ? "top-12" : "top-3"
            }`}
          >
            <button
              type="button"
              onClick={() => startEditComment(comment)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/92 text-slate-400 shadow-sm transition-all hover:bg-primary-50 hover:text-primary-600"
              title={t("image_details.edit_comment")}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setDeleteCommentError("");
                setDeleteCommentId(comment.id);
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/92 text-slate-400 shadow-sm transition-all hover:bg-red-50 hover:text-red-600"
              title={t("image_details.delete_comment")}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : null}
        <div className={`mb-2 flex items-center gap-2 ${commentControlsPadding}`}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={resolveMediaUrl(comment.author?.avatarUrl)} alt={comment.author?.realName ?? t("image_details.user")} />
            <AvatarFallback>{t("image_details.user")}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800">
              {comment.author?.visibleName ?? comment.author?.realName ?? t("image_details.deleted_user")}
              {reviewLabel}
              {isOwnerReply ? (
                <span className="mr-1.5 text-xs font-normal text-primary-600"> · {t("image_details.owner_reply_badge")}</span>
              ) : null}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDateFa(comment.createdAt)} | {formatTimeFa(comment.createdAt)}
            </p>
          </div>
        </div>

        {isEditing ? (
          <div className={`space-y-2 ${commentControlsPadding}`}>
            <Textarea
              value={editCommentText}
              onChange={(e) => setEditCommentText(e.target.value)}
              className="min-h-[100px]"
            />
            {editCommentError ? <Alert variant="error">{editCommentError}</Alert> : null}
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" disabled={updatingComment} onClick={() => void handleSaveCommentEdit()}>
                {updatingComment ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                {t("image_details.save_comment_edit")}
              </Button>
              <Button type="button" size="sm" variant="secondary" disabled={updatingComment} onClick={cancelEditComment}>
                {t("image_details.cancel_comment_edit")}
              </Button>
            </div>
          </div>
        ) : (
          <p className={`text-sm leading-6 text-slate-700 ${commentControlsPadding}`}>{comment.text}</p>
        )}

        {isImageOwner && !nested && !isEditing ? (
          <div className="mt-2 border-t border-slate-100/80 pt-2">
            {replyToId === comment.id ? (
              <div className="space-y-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={t("image_details.reply_placeholder")}
                  className="min-h-[88px]"
                />
                {replyError ? <Alert variant="error">{replyError}</Alert> : null}
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" disabled={replyingOwner} onClick={() => void handleSubmitOwnerReply()}>
                    {replyingOwner ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                    {t("image_details.submit_reply")}
                  </Button>
                  <Button type="button" size="sm" variant="secondary" disabled={replyingOwner} onClick={cancelOwnerReply}>
                    {t("image_details.cancel_reply")}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 gap-1.5 px-2 text-primary-700"
                onClick={() => {
                  setReplyToId(comment.id);
                  setReplyText("");
                  setReplyError("");
                }}
              >
                <Reply className="h-3.5 w-3.5" />
                {t("image_details.reply_to_comment")}
              </Button>
            )}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <>
    <div className="grid items-start gap-5 xl:grid-cols-[1.3fr,1fr]">
      <Card className="overflow-hidden border-white/70" data-section="image" data-image-id={image.id}>
        <div className="relative w-full overflow-hidden rounded-t-2xl bg-slate-100">
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            className={`${glassControlClassName} left-3 top-3 h-11 w-11 px-0 py-0`}
            title={t("image_details.zoom")}
          >
            <Maximize2 className="h-5 w-5" />
          </button>
          {isPlatformAdmin && canManageFestival && (
            <button
              type="button"
              onClick={handleToggleFeatured}
              className={`${featuredControlClassName} ${image.isTopImage ? "text-amber-700" : ""}`}
              title={image.isTopImage ? t("image_details.remove_featured") : t("image_details.set_featured")}
            >
              <Award className="h-4 w-4" />
              {image.isTopImage ? t("image_details.admin_featured") : t("image_details.set_featured")}
            </button>
          )}
          <div
            className={`absolute right-3 z-10 ${isPlatformAdmin ? "top-16" : "top-3"}`}
          >
            <div className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold ${glassBadgeClassName}`}>
              <div className="flex items-center gap-1 text-slate-700">
                <span>{formatNumberFa(image.commentCount)}</span>
                <MessageCircle className="h-4 w-4" />
              </div>
              {canSeeJudgeSignals && image.judgeRatingCount > 0 ? (
                <>
                  <span className="h-4 w-px bg-slate-200" />
                  <div className="flex items-center gap-1 text-violet-700">
                    <span>
                      {formatNumberFa(Number(judgeAverageRating.toFixed(1)))} {t("image_details.of_5")}
                    </span>
                    <Star className="h-4 w-4 fill-violet-500 text-violet-500" />
                  </div>
                </>
              ) : null}
            </div>
          </div>
          {hasMultipleImages ? (
            <>
              <button
                type="button"
                onClick={goToPreviousImage}
                className={`${glassControlClassName} right-3 top-1/2 h-11 w-11 -translate-y-1/2 px-0 py-0`}
                title={t("image_details.prev_image")}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goToNextImage}
                className={`${glassControlClassName} left-3 top-1/2 h-11 w-11 -translate-y-1/2 px-0 py-0`}
                title={t("image_details.next_image")}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {formatNumberFa(activeImageIndex + 1)} / {formatNumberFa(galleryImages.length)}
              </div>
            </>
          ) : null}
          <img alt={image.title ?? ""} className="max-h-[70vh] w-full object-contain" src={resolveMediaUrl(activeImageUrl)} />
        </div>
        <ImageZoomOverlay
          alt={image.title ?? ""}
          onClose={() => setZoomOpen(false)}
          onNext={hasMultipleImages ? goToNextImage : undefined}
          onPrevious={hasMultipleImages ? goToPreviousImage : undefined}
          open={zoomOpen}
          currentIndex={activeImageIndex}
          src={resolveMediaUrl(activeImageUrl)}
          totalCount={galleryImages.length}
          nextLabel={t("image_details.next_image")}
          prevLabel={t("image_details.prev_image")}
        />
        <CardContent className="space-y-2 p-5">
          <h2 className="text-xl font-bold text-slate-800">{image.title}</h2>
          <p className="text-sm text-muted-foreground">
            {t("image_details.owner")}: {image.author?.visibleName ?? image.author?.realName ?? t("image_details.unknown")}
          </p>
          <p className="text-sm text-muted-foreground">{t("image_details.registered_date")}: {formatDateFa(image.createdAt)}</p>
          {image.description?.trim() ? (
            <div className="border-t border-slate-100 pt-3">
              <p className="mb-1.5 text-xs font-semibold text-slate-500">{t("image_details.description_label")}</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{image.description.trim()}</p>
            </div>
          ) : null}
          {hasMultipleImages ? (
            <div className="grid grid-cols-3 gap-2 pt-2 sm:grid-cols-4">
              {galleryImages.map((galleryUrl, index) => {
                const isActive = index === activeImageIndex;
                return (
                  <button
                    type="button"
                    key={`${galleryUrl}-${index}`}
                    onClick={() => setActiveImageIndex(index)}
                    className={`overflow-hidden rounded-2xl border-2 transition ${
                      isActive ? "border-primary-500 ring-2 ring-primary-100" : "border-slate-200 hover:border-primary-300"
                    }`}
                  >
                    <img
                      alt={`${image.title ?? t("image_details.owner")} ${index + 1}`}
                      className="aspect-square h-full w-full object-cover"
                      src={resolveMediaUrl(galleryUrl)}
                    />
                  </button>
                );
              })}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="border-white/70" data-section="comments" data-image-id={image.id}>
          <CardHeader>
            <CardTitle>{t("image_details.comments_title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rootComments.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("image_details.no_comments")}</p>
            ) : (
              rootComments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  {renderCommentCard(comment, false)}
                  {(repliesByParentId.get(comment.id) ?? []).map((reply) => (
                    <Fragment key={reply.id}>{renderCommentCard(reply, true)}</Fragment>
                  ))}
                </div>
              ))
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
            {image.userId === currentUser.id ? (
              <div className="space-y-2 rounded-2xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
                <p>{t("image_details.cannot_comment_own_work")}</p>
                <p className="text-xs font-normal text-amber-900/80">{t("image_details.owner_can_reply_hint")}</p>
              </div>
            ) : (
              <form className="space-y-3" onSubmit={handleSubmit} noValidate>
                <StarRating
                  color={isJudgeUser ? "purple" : "amber"}
                  max={isJudgeUser ? judgeMaxScore : 5}
                  onChange={setRating}
                  value={rating}
                />
                <Textarea
                  onChange={(event) => setText(event.target.value)}
                  placeholder={t("image_details.comment_placeholder")}
                  value={text}
                />
                {error ? <Alert variant="error">{error}</Alert> : null}
                <Button disabled={submittingComment} type="submit">
                  {submittingComment ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                  {t("image_details.submit_comment")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>

      {deleteCommentId !== null &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(4px)" }}
            dir="rtl"
            onMouseDown={(e) => {
              if (!deletingComment && e.target === e.currentTarget) {
                setDeleteCommentId(null);
                setDeleteCommentError("");
              }
            }}
          >
            <div
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
              style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
            >
              <div className="p-6">
                <h4 className="mb-3 text-center text-lg font-bold text-slate-800">{t("image_details.delete_comment_confirm_title")}</h4>
                <p className="mb-6 text-center text-sm leading-relaxed text-slate-600">{t("image_details.delete_comment_confirm")}</p>
                {deleteCommentError ? (
                  <Alert variant="error" className="mb-4">
                    {deleteCommentError}
                  </Alert>
                ) : null}
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <Button
                    type="button"
                    variant="danger"
                    className="sm:min-w-[8rem]"
                    disabled={deletingComment}
                    onClick={() => void handleConfirmDeleteComment()}
                  >
                    {deletingComment ? t("image_details.deleting_comment") : t("image_details.delete_comment_action")}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="sm:min-w-[8rem]"
                    disabled={deletingComment}
                    onClick={() => {
                      setDeleteCommentId(null);
                      setDeleteCommentError("");
                    }}
                  >
                    {t("admin.cancel")}
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
