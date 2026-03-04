import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { useAppStore } from "@/app/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageCard } from "@/features/streams/image-card";
import { CreateImageModal } from "@/features/streams/create-image-modal";
import { StreamStatusBadge } from "@/features/streams/stream-status-badge";
import { getVisibleName } from "@/lib/display-name";
import { formatNumberFa } from "@/lib/format";

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
              ارسال تصویر جدید
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
  const { currentUser, streams, images, users, comments, createImageForStream } = useAppStore();

  const [filter, setFilter] = useState<"featured" | "newest" | "oldest" | "top_rated">("newest");
  const [dialogOpen, setDialogOpen] = useState(false);

  const stream = streams.find((item) => item.id === streamId);

  if (!currentUser || !stream) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>این جریان پیدا نشد.</p>
        </CardContent>
      </Card>
    );
  }

  const streamImages = images.filter((image) => image.streamId === stream.id);
  const featuredImages = streamImages.filter((image) => image.isFeatured);

  const filteredImages = (() => {
    let list =
      filter === "featured"
        ? streamImages.filter((image) => image.isFeatured)
        : streamImages;

    if (filter === "newest") {
      list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (filter === "oldest") {
      list = [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (filter === "top_rated") {
      list = [...list].sort((a, b) => {
        const aComments = comments.filter((c) => c.imageId === a.id);
        const bComments = comments.filter((c) => c.imageId === b.id);
        const aAvg = aComments.length ? aComments.reduce((s, c) => s + c.rating, 0) / aComments.length : 0;
        const bAvg = bComments.length ? bComments.reduce((s, c) => s + c.rating, 0) / bComments.length : 0;
        return bAvg - aAvg;
      });
    }
    return list;
  })();

  const canUpload = stream.status === "opened" && currentUser.role !== "judge";

  const handleUploadComplete = (url: string, title: string, _description: string) => {
    const imageId = createImageForStream(stream.id, { url, title });
    setDialogOpen(false);
    if (imageId) {
      navigate(`/images/${imageId}`);
    }
  };

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-white/70">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="aspect-video overflow-hidden lg:aspect-auto lg:min-h-[260px]">
            <img alt={stream.name} className="h-full w-full object-cover" src={stream.coverUrl} />
          </div>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-2xl font-bold text-slate-800">{stream.name}</h2>
              <StreamStatusBadge status={stream.status} />
            </div>

            <CardDescription>{stream.conceptDescription}</CardDescription>

            {stream.conceptMediaUrl ? (
              <div className="overflow-hidden rounded-2xl border border-border bg-primary-50">
                {stream.conceptMediaType === "video" ? (
                  <video className="w-full" controls src={stream.conceptMediaUrl} />
                ) : (
                  <img alt="کانسپت" className="h-52 w-full object-cover" src={stream.conceptMediaUrl} />
                )}
              </div>
            ) : null}

            <div className="rounded-2xl bg-primary-50/80 p-3 text-sm leading-6 text-muted-foreground">
              <h3 className="mb-1 font-semibold text-slate-700">قواعد فرم</h3>
              <p>{stream.formRules}</p>
            </div>

            {stream.status === "opened" && currentUser.role === "judge" ? (
              <p className="rounded-2xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
                حساب داور فقط امکان مشاهده دارد و ارسال تصویر غیرفعال است.
              </p>
            ) : null}
          </CardContent>
        </div>
      </Card>

      <Card className="border-white/70">
        <CardHeader>
          <CardTitle>گالری منتخب ادمین</CardTitle>
          <CardDescription>تصاویر تایید شده به همراه نقد رسمی مدیر جشنواره</CardDescription>
        </CardHeader>
        <CardContent>
          {featuredImages.length === 0 ? (
            <p className="text-sm text-muted-foreground">هنوز تصویری به بخش منتخب اضافه نشده است.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredImages.map((image) => {
                const owner = users.find((item) => item.id === image.ownerId);
                const subtitle = owner ? `اثر ${getVisibleName(currentUser, owner)}` : "";
                return <ImageCard image={image} key={image.id} subtitle={subtitle} />;
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-white/70">
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>اکسپلور همه تصاویر</CardTitle>
            <CardDescription>{formatNumberFa(streamImages.length)} تصویر در این جریان ثبت شده است.</CardDescription>
          </div>

          <Select onValueChange={(value) => setFilter(value as "featured" | "newest" | "oldest" | "top_rated")} value={filter}>
            <SelectTrigger className="w-full sm:w-52 text-right">
              <SelectValue placeholder="فیلتر نمایش" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">منتخب ادمین</SelectItem>
              <SelectItem value="newest">جدیدترین</SelectItem>
              <SelectItem value="oldest">قدیمی‌ترین</SelectItem>
              <SelectItem value="top_rated">پر امتیازترین</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent>
          <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {canUpload && <AddImagePlaceholder onClick={() => setDialogOpen(true)} />}

            {filteredImages.length === 0 && !canUpload ? (
              <p className="col-span-full text-sm text-muted-foreground">با این فیلتر تصویری پیدا نشد.</p>
            ) : (
              filteredImages.map((image) => {
                const owner = users.find((item) => item.id === image.ownerId);
                const subtitle = owner ? `اثر ${getVisibleName(currentUser, owner)}` : "";
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
        streamName={stream.name}
      />
    </div>
  );
}
