import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client/react";

import { useAppStore } from "@/app/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageCard } from "@/features/streams/image-card";
import { CreateImageModal } from "@/features/streams/create-image-modal";
import { StreamStatusBadge } from "@/features/streams/stream-status-badge";
import { t } from "@/lib/i18n";
import { GET_FESTIVAL_QUERY, GET_FESTIVAL_IMAGES_QUERY, UPLOAD_IMAGE_MUTATION } from "@/graphql/operations";
import type { Festival, ImageItem } from "@/types/models";

function AddImagePlaceholder({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="group block h-full w-full text-right outline-none focus:outline-none focus:ring-0">
      <div className="flex h-full min-h-[280px] overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/60">
        <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-6 transition-all group-hover:border-primary-300 group-hover:bg-primary-50/60">
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
    </button>
  );
}

export function StreamExplorePage() {
  const navigate = useNavigate();
  const { streamId } = useParams();
  const { currentUser } = useAppStore();

  const [filter, setFilter] = useState<"featured" | "newest" | "oldest" | "top_rated">("newest");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: festivalData, loading: festivalLoading } = useQuery<{ festival: Festival }>(GET_FESTIVAL_QUERY, {
    variables: { id: streamId },
    skip: !streamId,
  });

  const { data: imagesData, loading: imagesLoading } = useQuery<{ festivalImages: ImageItem[] }>(GET_FESTIVAL_IMAGES_QUERY, {
    variables: { festivalId: streamId },
    skip: !streamId,
  });

  const [uploadImage] = useMutation<{ uploadImage: { id: string } }>(UPLOAD_IMAGE_MUTATION, {
    refetchQueries: [{ query: GET_FESTIVAL_IMAGES_QUERY, variables: { festivalId: streamId } }],
  });

  const festival = festivalData?.festival;
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

  const canUpload = festival.status === "OPEN" && currentUser.role !== "JUDGE";

  const handleUploadComplete = async (url: string, title: string, _description: string) => {
    try {
      const { data } = await uploadImage({
        variables: { input: { festivalId: festival.id, url, title } },
      });
      setDialogOpen(false);
      if (data?.uploadImage?.id) {
        navigate(`/images/${data.uploadImage.id}`);
      }
    } catch {
      setDialogOpen(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-white/70">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="aspect-video overflow-hidden lg:aspect-auto lg:min-h-[260px]">
            <img alt={festival.name} className="h-full w-full object-cover" src={festival.coverImageUrl ?? ""} />
          </div>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-2xl font-bold text-slate-800">{festival.name}</h2>
              <StreamStatusBadge status={festival.status} />
            </div>

            <CardDescription>{festival.conceptText}</CardDescription>

            {festival.conceptMediaUrl ? (
              <div className="overflow-hidden rounded-2xl border border-border bg-primary-50">
                {festival.conceptMediaType === "VIDEO" ? (
                  <video className="w-full" controls src={festival.conceptMediaUrl} />
                ) : (
                  <img alt={t("stream_explore.concept_alt")} className="h-52 w-full object-cover" src={festival.conceptMediaUrl} />
                )}
              </div>
            ) : null}

            <div className="rounded-2xl bg-primary-50/80 p-3 text-sm leading-6 text-muted-foreground">
              <h3 className="mb-1 font-semibold text-slate-700">{t("stream_explore.rules_title")}</h3>
              <p>{festival.rulesText}</p>
            </div>

            {festival.status === "OPEN" && currentUser.role === "JUDGE" ? (
              <p className="rounded-2xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {t("stream_explore.judge_readonly")}
              </p>
            ) : null}
          </CardContent>
        </div>
      </Card>

      <Card className="border-white/70">
        <CardHeader>
          <CardTitle>{t("stream_explore.featured_gallery")}</CardTitle>
          <CardDescription>{t("stream_explore.featured_desc")}</CardDescription>
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

      <Card className="border-white/70">
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t("stream_explore.explore_all")}</CardTitle>
            <CardDescription>{t("stream_explore.images_in_stream", { count: streamImages.length })}</CardDescription>
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
            {canUpload && <AddImagePlaceholder onClick={() => setDialogOpen(true)} />}

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

      <CreateImageModal
        onClose={() => setDialogOpen(false)}
        onComplete={handleUploadComplete}
        open={dialogOpen}
        streamName={festival.name}
      />
    </div>
  );
}
