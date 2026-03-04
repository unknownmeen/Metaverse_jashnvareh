import { Images, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAppStore } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageCard } from "@/features/streams/image-card";
import { formatNumberFa } from "@/lib/format";

export function HomePage() {
  const navigate = useNavigate();
  const { currentUser, images, streams } = useAppStore();

  if (!currentUser) {
    return null;
  }

  const myImages = images.filter((image) => image.ownerId === currentUser.id);

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-white/70 bg-gradient-to-l from-primary-100/60 to-white/80">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-800">گالری تصاویر من</h2>
              <p className="text-sm text-muted-foreground">تمام تصاویر تولید شده شما در جریان های مختلف در این بخش نمایش داده می شود.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-2xl bg-white/70 px-4 py-2 text-sm">
                <span className="font-bold text-primary-600">{formatNumberFa(myImages.length)}</span> تصویر
              </div>
              <div className="rounded-2xl bg-white/70 px-4 py-2 text-sm">
                <span className="font-bold text-emerald-700">{formatNumberFa(streams.length)}</span> جریان
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {myImages.length === 0 ? (
        <Card className="border-dashed border-primary-200 bg-white/80">
          <CardContent className="space-y-3 p-6">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <Sparkles className="h-5 w-5 text-amber-500" />
              هنوز تصویری ثبت نکرده اید
            </h3>
            <p className="text-sm text-muted-foreground">
              برای شروع کافی است در یکی از جریان های فعال شرکت کنید و تصویر خودتان را ارسال کنید.
            </p>
            <Button onClick={() => navigate("/streams")}>مشاهده جریان ها</Button>
          </CardContent>
        </Card>
      ) : (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <Images className="h-5 w-5 text-primary-500" />
            تصاویر من
          </h3>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {myImages.map((image) => {
              const streamName = streams.find((stream) => stream.id === image.streamId)?.name ?? "";
              return <ImageCard image={image} key={image.id} subtitle={streamName} />;
            })}
          </div>
        </section>
      )}
    </div>
  );
}
