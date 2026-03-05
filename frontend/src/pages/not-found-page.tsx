import { Link } from "react-router-dom";
import { t } from "@/lib/i18n";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg border-white/70 text-center">
        <CardContent className="space-y-4 p-8">
          <h1 className="text-3xl font-bold text-slate-800">{t("not_found.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("not_found.desc")}</p>
          <Button asChild>
            <Link to="/home">{t("not_found.back_home")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
