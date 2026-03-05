import { type FormEvent, useRef, useState } from "react";
import { Camera, Eye, EyeOff, Loader2, Lock, LogOut, Save, User } from "lucide-react";
import { useMutation } from "@apollo/client/react";

import { useAppStore } from "@/app/store";
import { Alert } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatPhoneFa, toEnglishDigits } from "@/lib/format";
import { t } from "@/lib/i18n";
import { UPDATE_PROFILE_MUTATION } from "@/graphql/operations";

export function ProfilePage() {
  const { currentUser, logout } = useAppStore();

  const [realName, setRealName] = useState(currentUser?.realName ?? "");
  const [displayName, setDisplayName] = useState(currentUser?.displayName ?? "");
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatarUrl ?? "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");

  const [updateProfile, { loading: saving }] = useMutation(UPDATE_PROFILE_MUTATION);

  if (!currentUser) {
    return null;
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedAvatar(reader.result as string);
      setUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!realName.trim()) {
      setMessage(t("profile.name_required"));
      return;
    }

    try {
      await updateProfile({
        variables: {
          input: {
            realName: realName.trim(),
            displayName: currentUser.gender === "FEMALE" ? displayName.trim() || undefined : undefined,
            newPassword: newPassword ? toEnglishDigits(newPassword) : undefined,
            avatarUrl: selectedAvatar || undefined,
          },
        },
      });

      setCurrentPassword("");
      setNewPassword("");
      setMessage("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setMessage(t("profile.save_error"));
    }
  };

  return (
    <div className="mx-auto max-w-lg animate-fade-in px-4 py-5">
      <h1 className="mb-6 text-xl font-black text-slate-800">{t("profile.title")}</h1>

      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <label className="mb-3 block text-xs font-semibold text-slate-400">{t("profile.upload_photo")}</label>
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="h-16 w-16 flex-shrink-0">
                <AvatarImage src={selectedAvatar || currentUser.avatarUrl || ""} alt={currentUser.realName} />
                <AvatarFallback className="bg-slate-200">
                  <User className="h-8 w-8 text-slate-500" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-slate-700">{realName || t("profile.profile_fallback")}</p>
                <p className="text-xs text-slate-400">
                  {selectedAvatar || currentUser.avatarUrl ? t("profile.saved") : t("profile.not_set")}
                </p>
              </div>
            </div>
            <input
              ref={avatarFileRef}
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              type="file"
            />
            <button
              type="button"
              onClick={() => avatarFileRef.current?.click()}
              disabled={uploadingAvatar}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-70"
            >
              {uploadingAvatar ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              ) : (
                <>
                  <Camera className="h-4 w-4" />
                  <span>{t("profile.upload_btn")}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="mb-1 text-sm font-bold text-slate-700">{t("profile.user_info")}</h3>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400" htmlFor="realName">
              {t("profile.full_name")}
            </label>
            <input
              id="realName"
              type="text"
              value={realName}
              onChange={(event) => setRealName(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-300 focus:ring-2 focus:ring-primary-300"
            />
          </div>

          {currentUser.gender === "FEMALE" ? (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400" htmlFor="displayName">
                {t("profile.display_name")}
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-300 focus:ring-2 focus:ring-primary-300"
              />
            </div>
          ) : null}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">{t("profile.phone")}</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3">
              <span className="flex-1 text-sm font-medium text-slate-600" dir="ltr">
                {formatPhoneFa(currentUser.phone)}
              </span>
              <span className="flex-shrink-0 whitespace-nowrap rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-400">
                {t("profile.not_editable")}
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">{t("profile.gender")}</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3">
              <span className="flex-1 text-sm font-medium text-slate-600">
                {t(`gender.${currentUser.gender.toLowerCase()}`)}
              </span>
              <span className="flex-shrink-0 whitespace-nowrap rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-400">
                {t("profile.not_editable")}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-700">
            <Lock className="h-4 w-4 text-slate-400" />
            {t("profile.change_password")}
          </h3>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">{t("profile.current_password")}</label>
            <div className="relative">
              <input
                type={showCurrentPw ? "text" : "password"}
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder={t("profile.current_password_placeholder")}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-12 text-sm outline-none transition-all placeholder:text-slate-300 focus:border-primary-300 focus:ring-2 focus:ring-primary-300"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
              >
                {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">{t("profile.new_password")}</label>
            <div className="relative">
              <input
                type={showNewPw ? "text" : "password"}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder={t("profile.new_password_placeholder")}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-12 text-sm outline-none transition-all placeholder:text-slate-300 focus:border-primary-300 focus:ring-2 focus:ring-primary-300"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
              >
                {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {message ? <Alert variant="error">{message}</Alert> : null}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="submit"
            disabled={saving}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all shadow-lg active:scale-[0.98] ${
              saved
                ? "bg-emerald-500 text-white shadow-emerald-200"
                : "bg-gradient-to-l from-primary-500 to-primary-600 text-white shadow-primary-200 hover:shadow-xl hover:shadow-primary-200"
            }`}
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {saved ? t("profile.saved") : t("profile.save_changes")}
          </button>

          <button
            type="button"
            onClick={() => logout()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-3.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-200 active:scale-[0.98]"
          >
            <LogOut className="h-5 w-5" />
            {t("profile.logout")}
          </button>
        </div>
      </form>
    </div>
  );
}
