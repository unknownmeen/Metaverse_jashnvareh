import { type FormEvent, useMemo, useState } from "react";
import { Award, Maximize2 } from "lucide-react";

import { ImageZoomOverlay } from "@/components/shared/image-zoom-overlay";
import { useParams } from "react-router-dom";

import { useAppStore } from "@/app/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/features/comments/star-rating";
import { getVisibleName } from "@/lib/display-name";
import { formatDateFa, formatNumberFa, formatTimeFa } from "@/lib/format";

export function ImageDetailsPage() {
  const { imageId } = useParams();
  const { currentUser, images, comments, users, addComment, toggleImageFeatured } = useAppStore();

  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [zoomOpen, setZoomOpen] = useState(false);

  const image = images.find((item) => item.id === imageId);

  const imageComments = useMemo(() => {
    if (!image) {
      return [];
    }

    return comments
      .filter((comment) => comment.imageId === image.id)
      .sort((a, b) => {
        if (a.isCritique && !b.isCritique) {
          return -1;
        }
        if (!a.isCritique && b.isCritique) {
          return 1;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [comments, image]);

  if (!currentUser || !image) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>تصویر مورد نظر پیدا نشد.</p>
        </CardContent>
      </Card>
    );
  }

  const imageOwner = users.find((user) => user.id === image.ownerId);
  const commentsWithUser = imageComments.map((comment) => ({
    comment,
    author: users.find((user) => user.id === comment.userId),
  }));

  const averageRating = imageComments.length
    ? imageComments.reduce((sum, item) => sum + item.rating, 0) / imageComments.length
    : 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (rating === 0 || text.trim().length < 5) {
      setError("برای ثبت نظر، امتیاز ستاره ای و متن حداقل ۵ حرفی الزامی است.");
      return;
    }

    addComment(image.id, rating, text.trim());
    setRating(0);
    setText("");
    setError("");
  };

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[1.3fr,1fr]">
      <Card className="overflow-hidden border-white/70">
        <div className="relative w-full overflow-hidden rounded-t-2xl bg-slate-100">
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            className="absolute left-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-slate-600 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:text-primary-600"
            title="بزرگنمایی"
          >
            <Maximize2 className="h-5 w-5" />
          </button>
          {currentUser?.role === "admin" && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggleImageFeatured(image.id);
              }}
              className={`absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold shadow-lg transition-all backdrop-blur-sm ${
                image.isFeatured
                  ? "bg-amber-400 text-amber-900 hover:bg-amber-500"
                  : "bg-white/80 text-slate-600 hover:bg-white hover:text-amber-700"
              }`}
              title={image.isFeatured ? "برداشتن از منتخب" : "انتخاب به عنوان منتخب"}
            >
              <Award className="h-4 w-4" />
              {image.isFeatured ? "منتخب ادمین" : "انتخاب به عنوان منتخب"}
            </button>
          )}
          <img
            alt={image.title}
            className="max-h-[70vh] w-full object-contain"
            src={image.url}
          />
        </div>
        <ImageZoomOverlay
          alt={image.title}
          onClose={() => setZoomOpen(false)}
          open={zoomOpen}
          src={image.url}
        />
        <CardContent className="space-y-2 p-5">
          <h2 className="text-xl font-bold text-slate-800">{image.title}</h2>
          <p className="text-sm text-muted-foreground">صاحب اثر: {imageOwner ? getVisibleName(currentUser, imageOwner) : "نامشخص"}</p>
          <p className="text-sm text-muted-foreground">تاریخ ثبت: {formatDateFa(image.createdAt)}</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {/* نظرات کاربران - بالای فرم ثبت نظر */}
        <Card className="border-white/70">
          <CardHeader>
            <CardTitle>نظرات کاربران</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {commentsWithUser.length === 0 ? (
              <p className="text-sm text-muted-foreground">هنوز نظری ثبت نشده است.</p>
            ) : (
              commentsWithUser.map(({ comment, author }) => (
                <div
                  className={`rounded-2xl border p-3 ${
                    comment.isCritique ? "border-amber-200 bg-amber-50/70" : "border-border bg-white"
                  }`}
                  key={comment.id}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={author?.avatarUrl} alt={author?.realName ?? "کاربر"} />
                      <AvatarFallback>کاربر</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">
                        {author ? getVisibleName(currentUser, author) : "کاربر حذف شده"}
                        {comment.isCritique ? " (نقد رسمی ادمین)" : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateFa(comment.createdAt)} | {formatTimeFa(comment.createdAt)}
                      </p>
                    </div>

                    <StarRating readonly size="sm" value={comment.rating} />
                  </div>

                  <p className="text-sm leading-6 text-slate-700">{comment.text}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* ثبت نظر و امتیاز - پایین نظرات */}
        <Card className="border-white/70">
          <CardHeader>
            <CardTitle>ثبت نظر و امتیاز</CardTitle>
            <CardDescription>
              میانگین امتیاز: {formatNumberFa(Number(averageRating.toFixed(1)))} از ۵ - {formatNumberFa(imageComments.length)} نظر
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentUser.role === "judge" ? (
              <p className="rounded-2xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
                حساب داور فقط امکان مشاهده دارد و ثبت نظر یا امتیاز برای آن فعال نیست.
              </p>
            ) : (
              <form className="space-y-3" onSubmit={handleSubmit}>
                <StarRating onChange={setRating} value={rating} />
                <Textarea
                  onChange={(event) => setText(event.target.value)}
                  placeholder="نظرتان را درباره این تصویر بنویسید..."
                  value={text}
                />
                {error ? <p className="rounded-xl bg-rose-50 p-2 text-sm text-rose-600">{error}</p> : null}
                <Button type="submit">ثبت نظر</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
