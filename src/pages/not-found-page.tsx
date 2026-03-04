import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg border-white/70 text-center">
        <CardContent className="space-y-4 p-8">
          <h1 className="text-3xl font-bold text-slate-800">صفحه پیدا نشد</h1>
          <p className="text-sm text-muted-foreground">آدرسی که وارد کرده اید معتبر نیست.</p>
          <Button asChild>
            <Link to="/home">بازگشت به خانه</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
