import { Images, Loader2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client/react";

import { useAppStore } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageCard } from "@/features/streams/image-card";
import { formatNumberFa } from "@/lib/format";
import { t } from "@/lib/i18n";
import { GET_MY_IMAGES_QUERY, GET_FESTIVALS_QUERY } from "@/graphql/operations";
import type { ImageItem, Festival } from "@/types/models";

export function HomePage() {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();

  const { data: imagesData, loading: imagesLoading } = useQuery<{ myImages: ImageItem[] }>(GET_MY_IMAGES_QUERY);
  const { data: festivalsData } = useQuery<{ festivals: Festival[] }>(GET_FESTIVALS_QUERY);

  if (!currentUser) {
    return null;
  }

  const myImages = imagesData?.myImages ?? [];
  const festivals = festivalsData?.festivals ?? [];

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-white/70 bg-gradient-to-l from-primary-100/60 to-white/80">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-800">{t("home.gallery_title")}</h2>
              <p className="text-sm text-muted-foreground">{t("home.gallery_desc")}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-2xl bg-white/70 px-4 py-2 text-sm">
                <span className="font-bold text-primary-600">{formatNumberFa(myImages.length)}</span> {t("home.image_label")}
              </div>
              <div className="rounded-2xl bg-white/70 px-4 py-2 text-sm">
                <span className="font-bold text-emerald-700">{formatNumberFa(festivals.length)}</span> {t("home.stream_label")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {imagesLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : myImages.length === 0 ? (
        <Card className="border-dashed border-primary-200 bg-white/80">
          <CardContent className="space-y-3 p-6">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <Sparkles className="h-5 w-5 text-amber-500" />
              {t("home.no_images")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("home.no_images_hint")}
            </p>
            <Button onClick={() => navigate("/streams")}>{t("home.view_streams")}</Button>
          </CardContent>
        </Card>
      ) : (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <Images className="h-5 w-5 text-primary-500" />
            {t("home.my_images")}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {myImages.map((image) => {
              const festivalName = festivals.find((f) => f.id === image.festivalId)?.name ?? "";
              return <ImageCard image={image} key={image.id} subtitle={festivalName} />;
            })}
          </div>
        </section>
      )}
    </div>
  );
}
