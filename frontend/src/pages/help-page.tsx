import { CircleHelp, MapPinned, Sparkles } from "lucide-react";
import { useQuery } from "@apollo/client/react";

import { useAppStore } from "@/app/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GET_LATEST_PUBLISHED_RELEASE_QUERY } from "@/graphql/operations";
import { toPersianDigits } from "@/lib/format";
import { t } from "@/lib/i18n";
import type { Release } from "@/types/models";

export function HelpPage() {
  const { openChangelog } = useAppStore();
  const { data } = useQuery<{ latestPublishedRelease: Release | null }>(GET_LATEST_PUBLISHED_RELEASE_QUERY);
  const latestVersion = data?.latestPublishedRelease?.version;

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
        <CardContent className="space-y-3 p-5 text-sm text-slate-700">
          <button
            type="button"
            onClick={() => openChangelog()}
            className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-right transition-colors hover:bg-primary-50"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span className="font-medium text-slate-700">{t("help.whats_new")}</span>
            </span>
            {latestVersion ? (
              <span className="inline-flex rounded-md bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                {t("changelog.version_prefix")} {toPersianDigits(latestVersion)}
              </span>
            ) : null}
          </button>
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-amber-500" />
            {t("help.support")}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
