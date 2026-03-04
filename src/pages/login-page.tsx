import { type FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppStore } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatPhoneFa, getRoleLabel } from "@/lib/format";

export function LoginPage() {
  const navigate = useNavigate();
  const { users, login } = useAppStore();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const demoUsers = useMemo(
    () => users.map((user) => ({ id: user.id, phone: user.phone, password: user.password, roleLabel: getRoleLabel(user.role) })),
    [users],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ok = login(phone, password);

    if (!ok) {
      setError("شماره موبایل یا رمز عبور صحیح نیست.");
      return;
    }

    navigate("/home", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl">
        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="overflow-hidden border-white/70 lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-800">ورود به Building</CardTitle>
              <CardDescription>با شماره موبایل و رمز عبور وارد پلتفرم جشنواره های بصری شوید.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="phone">
                    شماره موبایل
                  </label>
                  <Input
                    dir="ltr"
                    id="phone"
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                    value={phone}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="password">
                    رمز عبور
                  </label>
                  <Input
                    id="password"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="رمز عبور را وارد کنید"
                    type="password"
                    value={password}
                  />
                </div>

                {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p> : null}

                <Button className="w-full" type="submit">
                  ورود
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-white/70 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">اکانت های نمونه</CardTitle>
              <CardDescription>برای تست سریع UX می توانید از این حساب ها استفاده کنید.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {demoUsers.map((user) => (
                <button
                  className="w-full rounded-2xl border border-border bg-primary-50/70 p-3 text-right transition hover:bg-primary-100"
                  key={user.id}
                  onClick={() => {
                    setPhone(user.phone);
                    setPassword(user.password);
                    setError("");
                  }}
                  type="button"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-800">{user.roleLabel}</span>
                    <span className="text-xs text-muted-foreground">رمز: {user.password}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatPhoneFa(user.phone)}</p>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
