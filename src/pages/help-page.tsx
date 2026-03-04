import { CircleHelp, MapPinned, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HelpPage() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-800">راهنمای پلتفرم</h2>
        <p className="text-sm text-muted-foreground">راهنمای سریع استفاده از Building برای کاربران جدید</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-white/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPinned className="h-5 w-5 text-primary-500" />
              مسیرهای اصلی
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p>خانه: مشاهده گالری تصاویر خودتان</p>
            <p>جریان ها: ورود به جشنواره ها و اکسپلور تصاویر</p>
            <p>پروفایل: ویرایش اطلاعات شخصی</p>
            <p>نمای ادمین: مدیریت جریان ها (فقط ادمین)</p>
          </CardContent>
        </Card>

        <Card className="border-white/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CircleHelp className="h-5 w-5 text-primary-500" />
              نکات مهم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p>ثبت نظر و امتیاز به صورت همزمان انجام می شود.</p>
            <p>در جریان های پایان یافته امکان ارسال تصویر جدید وجود ندارد.</p>
            <p>در تصاویر منتخب، نقد ادمین به صورت پین شده در بالای نظرات نمایش داده می شود.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/70 bg-gradient-to-r from-primary-50 to-white">
        <CardContent className="flex items-center gap-3 p-5 text-sm text-slate-700">
          <Sparkles className="h-5 w-5 text-amber-500" />
          اگر نیاز به پشتیبانی داشتید، از طریق تیم محصول پیام بگذارید.
        </CardContent>
      </Card>
    </div>
  );
}
