import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, LogIn, Phone } from "lucide-react";

import { useAppStore } from "@/app/store";
import { toEnglishDigits, toPersianDigits } from "@/lib/format";
import { t } from "@/lib/i18n";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAppStore();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const phoneClean = toEnglishDigits(phone).replace(/\D/g, "");
    const passwordClean = toEnglishDigits(password);
    if (!phoneClean.trim()) {
      setError(t("common.field_required"));
      return;
    }
    if (!passwordClean.trim()) {
      setError(t("common.field_required"));
      return;
    }

    setSubmitting(true);
    const ok = await login(phoneClean, passwordClean);

    if (!ok) {
      setError(t("login.invalid_credentials"));
      setSubmitting(false);
      return;
    }

    navigate("/home", { replace: true });
  };

  const formContent = (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl border border-slate-100 bg-white p-7 shadow-xl shadow-slate-200/50"
      noValidate
    >
      {error ? (
        <div className="animate-fade-in rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      ) : null}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-500">
          {t("login.phone_label")}
        </label>
        <div className="relative">
          <Phone className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              const normalized = toEnglishDigits(e.target.value).replace(/\D/g, "").slice(0, 11);
              setPhone(toPersianDigits(normalized));
              setError("");
            }}
            placeholder={t("login.phone_placeholder")}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pr-12 pl-4 text-sm transition-all placeholder:text-slate-300 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-300"
            dir="ltr"
            disabled={submitting}
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-500">
          {t("login.password_label")}
        </label>
        <div className="relative">
          <Lock className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            dir="ltr"
            placeholder={t("login.password_placeholder")}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pr-12 pl-12 text-sm transition-all placeholder:text-slate-300 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-300"
            disabled={submitting}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 transition-colors hover:text-slate-500"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-primary-500 to-primary-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-200 transition-all hover:shadow-xl hover:shadow-primary-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {t("common.logging_in")}
          </>
        ) : (
          <>
            <LogIn className="h-5 w-5" />
            {t("login.submit")}
          </>
        )}
      </button>
    </form>
  );

  return (
    <div className="flex min-h-screen flex-col bg-white lg:flex-row">
      {/* Desktop: Right panel — Hero image */}
      <div className="relative hidden items-center justify-center overflow-hidden pr-8 lg:flex lg:w-1/2 lg:pr-12">
        <div className="relative aspect-[3/4] w-full max-w-md shrink-0 overflow-hidden rounded-[2rem] shadow-xl">
          <img
            src="/login-hero.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </div>
      </div>

      {/* Desktop: Left panel — Form */}
      <div className="hidden min-h-screen flex-1 items-center justify-start p-4 lg:flex lg:p-6 lg:pr-8 xl:pr-12">
        <div className="w-full max-w-sm">{formContent}</div>
      </div>

      {/* Mobile: image + form centered */}
      <div className="flex flex-1 flex-col items-center justify-center gap-5 p-4 sm:gap-6 sm:p-6 lg:hidden">
        <div className="w-full max-w-sm flex-shrink-0">
          <div className="ring-1 ring-slate-100/80 aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-xl shadow-slate-200/60">
            <img
              src="/login-hero.png"
              alt=""
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>
        <div className="w-full max-w-sm">{formContent}</div>
      </div>
    </div>
  );
}
