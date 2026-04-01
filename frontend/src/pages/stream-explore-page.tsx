import { useEffect, useState } from "react";
import { Loader2, Maximize2, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client/react";

import { useAppStore } from "@/app/store";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageCard } from "@/features/streams/image-card";
import { CreateImageModal } from "@/features/streams/create-image-modal";
import { StreamStatusBadge } from "@/features/streams/stream-status-badge";
import { t } from "@/lib/i18n";
import { isJudgeRole } from "@/lib/roles";
import { resolveMediaUrl } from "@/lib/upload";
import { GET_FESTIVAL_QUERY, GET_FESTIVAL_IMAGES_QUERY, UPLOAD_IMAGE_MUTATION } from "@/graphql/operations";
import type { Festival, ImageItem } from "@/types/models";

function AddImagePlaceholder({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full min-h-0 w-full min-w-0 justify-self-stretch self-stretch text-right outline-none focus:outline-none focus:ring-0"
    >
      <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white text-right shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/60">
        <div className="relative min-h-[14rem] flex-1 overflow-hidden rounded-3xl bg-slate-100">
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-6 transition-all group-hover:border-primary-300 group-hover:bg-primary-50/60">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm transition-all group-hover:bg-primary-500 group-hover:shadow-lg group-hover:shadow-primary-200">
                <Plus className="h-7 w-7 text-slate-300 transition-colors group-hover:text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-400 transition-colors group-hover:text-primary-600">
                {t("stream_explore.upload_new")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

export function StreamExplorePage() {
  const navigate = useNavigate();
  const { streamId } = useParams();
  const { currentUser } = useAppStore();

  const [filter, setFilter] = useState<"featured" | "newest" | "oldest" | "top_rated">("newest");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [conceptFullscreenOpen, setConceptFullscreenOpen] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const { data: festivalData, loading: festivalLoading } = useQuery<{ festival: Festival }>(GET_FESTIVAL_QUERY, {
    variables: { idOrSlug: streamId },
    skip: !streamId,
  });

  const festival = festivalData?.festival;

  const { data: imagesData, loading: imagesLoading } = useQuery<{ festivalImages: ImageItem[] }>(GET_FESTIVAL_IMAGES_QUERY, {
    variables: { festivalId: festival?.id ?? streamId },
    skip: !festival?.id,
  });

  const [uploadImage] = useMutation<{ uploadImage: { id: string } }>(UPLOAD_IMAGE_MUTATION);

  // ریدایرکت از UUID به slug فارسی در آدرس
  const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
  useEffect(() => {
    if (festival?.slug && streamId && isUuid(streamId) && streamId !== festival.slug) {
      navigate(`/streams/${festival.slug}`, { replace: true });
    }
  }, [festival?.slug, streamId, navigate]);
  const streamImages = imagesData?.festivalImages ?? [];

  if (festivalLoading || imagesLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!currentUser || !festival) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>{t("stream_explore.not_found")}</p>
        </CardContent>
      </Card>
    );
  }

  const featuredImages = streamImages.filter((image) => image.isTopImage);

  const filteredImages = (() => {
    let list = filter === "featured" ? streamImages.filter((image) => image.isTopImage) : [...streamImages];

    if (filter === "newest") {
      list = list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (filter === "oldest") {
      list = list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (filter === "top_rated") {
      list = list.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
    }
    return list;
  })();

  const canUpload = festival.status === "OPEN" && !isJudgeRole(currentUser.role);

  const handleUploadComplete = async (urls: string[], title: string, description: string, coverIndex: number) => {
    setUploadError("");
    try {
      const { data } = await uploadImage({
        variables: { input: { festivalId: festival.id, urls, title, description, coverIndex } },
        refetchQueries: [{ query: GET_FESTIVAL_IMAGES_QUERY, variables: { festivalId: festival.id } }],
        awaitRefetchQueries: true,
      });
      setDialogOpen(false);
      if (data?.uploadImage?.id) {
        const img = data.uploadImage as ImageItem;
        navigate(`/images/${img.slug ?? img.id}`);
      }
    } catch (err: unknown) {
      setDialogOpen(false);
      setUploadError(err instanceof Error ? err.message : t("stream_explore.upload_error"));
    }
  };

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-white/70">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="aspect-video overflow-hidden lg:aspect-auto lg:min-h-[260px]">
            <img
              alt={festival.name}
              className={`h-full w-full object-cover ${festival.status === "CLOSED" ? "brightness-[0.5]" : ""}`}
              src={resolveMediaUrl(festival.coverImageUrl)}
            />
          </div>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-2xl font-bold text-slate-800">{festival.name}</h2>
              <StreamStatusBadge status={festival.status} />
            </div>

            {festival.conceptMediaUrl ? (
              <>
                <div className="relative overflow-hidden rounded-2xl border border-border bg-primary-50">
                  <div className="flex items-center justify-between border-b border-primary-100 px-3 py-1.5">
                    <span className="text-xs font-semibold text-primary-600">{t("stream_explore.concept_alt")}</span>
                    <button
                      type="button"
                      onClick={() => setConceptFullscreenOpen(true)}
                      className="flex items-center gap-1 rounded-md p-1.5 text-primary-600 transition-colors hover:bg-primary-100 hover:text-primary-700"
                      title={t("stream_explore.concept_fullscreen")}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                  </div>
                  {festival.conceptMediaType === "VIDEO" ? (
                    <video className="w-full" controls src={resolveMediaUrl(festival.conceptMediaUrl)} />
                  ) : (
                    <img alt={t("stream_explore.concept_alt")} className="h-52 w-full object-cover" src={resolveMediaUrl(festival.conceptMediaUrl)} />
                  )}
                </div>

                <Dialog onOpenChange={setConceptFullscreenOpen} open={conceptFullscreenOpen}>
                  <DialogContent className="max-h-[95vh] max-w-[95vw] border-0 bg-black/95 p-0 [&>button]:text-white [&>button]:hover:bg-white/20 [&>button]:hover:text-white">
                    <div className="flex h-[85vh] w-full items-center justify-center p-4">
                      {festival.conceptMediaType === "VIDEO" ? (
                        <video
                          className="max-h-full max-w-full object-contain"
                          controls
                          autoPlay
                          src={resolveMediaUrl(festival.conceptMediaUrl)}
                        />
                      ) : (
                        <img
                          alt={t("stream_explore.concept_alt")}
                          className="max-h-full max-w-full object-contain"
                          src={resolveMediaUrl(festival.conceptMediaUrl)}
                        />
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : null}

            <div className="rounded-2xl bg-primary-50/80 p-3 text-sm leading-6 text-muted-foreground">
              <h3 className="mb-1 font-semibold text-slate-700">{t("stream_explore.rules_title")}</h3>
              <p className="text-justify">{festival.rulesText?.trim() || t("stream_explore.rules_empty")}</p>
            </div>

            {festival.status === "OPEN" && isJudgeRole(currentUser.role) ? (
              <p className="rounded-2xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {t("stream_explore.judge_readonly")}
              </p>
            ) : null}
          </CardContent>
        </div>
      </Card>

      <Card className="border-white/70" data-section="featured" data-festival-id={festival.id}>
        <CardHeader>
          <CardTitle>{t("stream_explore.featured_gallery")}</CardTitle>
        </CardHeader>
        <CardContent>
          {featuredImages.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("stream_explore.no_featured")}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredImages.map((image) => {
                const subtitle = image.author ? `${t("stream_explore.by_author")} ${image.author.visibleName ?? image.author.realName}` : "";
                return <ImageCard image={image} key={image.id} subtitle={subtitle} />;
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-white/70" data-section="images" data-festival-id={festival.id}>
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t("stream_explore.explore_all")}</CardTitle>
          </div>

          <Select onValueChange={(value) => setFilter(value as typeof filter)} value={filter}>
            <SelectTrigger className="w-full sm:w-52 text-right">
              <SelectValue placeholder={t("stream_explore.filter_placeholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">{t("stream_explore.filter_featured")}</SelectItem>
              <SelectItem value="newest">{t("stream_explore.filter_newest")}</SelectItem>
              <SelectItem value="oldest">{t("stream_explore.filter_oldest")}</SelectItem>
              <SelectItem value="top_rated">{t("stream_explore.filter_top_rated")}</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent>
          <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {canUpload && (
              <AddImagePlaceholder onClick={() => setDialogOpen(true)} />
            )}

            {filteredImages.length === 0 && !canUpload ? (
              <p className="col-span-full text-sm text-muted-foreground">{t("stream_explore.no_results")}</p>
            ) : (
              filteredImages.map((image) => {
                const subtitle = image.author ? `${t("stream_explore.by_author")} ${image.author.visibleName ?? image.author.realName}` : "";
                return <ImageCard image={image} key={image.id} subtitle={subtitle} />;
              })
            )}
          </div>
        </CardContent>
      </Card>

      {uploadError ? <Alert variant="error">{uploadError}</Alert> : null}
      <CreateImageModal
        onClose={() => { setDialogOpen(false); setUploadError(""); }}
        onComplete={handleUploadComplete}
        open={dialogOpen}
        streamName={festival.name}
      />
    </div>
  );
}
