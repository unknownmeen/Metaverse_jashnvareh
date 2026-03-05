import { CircleHelp, MapPinned, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/i18n";

export function HelpPage() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-800">{t("help.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("help.desc")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-white/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPinned className="h-5 w-5 text-primary-500" />
              {t("help.main_routes")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p>{t("help.home_desc")}</p>
            <p>{t("help.streams_desc")}</p>
            <p>{t("help.profile_desc")}</p>
            <p>{t("help.admin_desc")}</p>
          </CardContent>
        </Card>

        <Card className="border-white/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CircleHelp className="h-5 w-5 text-primary-500" />
              {t("help.tips")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p>{t("help.tip_rating")}</p>
            <p>{t("help.tip_closed")}</p>
            <p>{t("help.tip_admin_review")}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/70 bg-gradient-to-r from-primary-50 to-white">
        <CardContent className="flex items-center gap-3 p-5 text-sm text-slate-700">
          <Sparkles className="h-5 w-5 text-amber-500" />
          {t("help.support")}
        </CardContent>
      </Card>
    </div>
  );
}
