import { type FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client/react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GET_FESTIVAL_QUERY, GET_FESTIVALS_QUERY, CREATE_FESTIVAL_MUTATION, UPDATE_FESTIVAL_MUTATION, UPDATE_FESTIVAL_STATUS_MUTATION } from "@/graphql/operations";
import { t } from "@/lib/i18n";
import { uploadFile } from "@/lib/upload";
import type { Festival, FestivalStatus } from "@/types/models";

interface FormState {
  name: string;
  coverImageUrl: string;
  conceptMediaUrl: string;
  conceptMediaType: "IMAGE" | "VIDEO";
  conceptText: string;
  rulesText: string;
  status: FestivalStatus;
}

const defaultForm: FormState = {
  name: "",
  coverImageUrl: "",
  conceptMediaUrl: "",
  conceptMediaType: "IMAGE",
  conceptText: "",
  rulesText: "",
  status: "OPEN",
};

function UploadCard({
  label,
  required,
  value,
  onChange,
  onMediaTypeChange,
  placeholder,
  acceptVideo,
  uploadFolder,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  onMediaTypeChange?: (t: "IMAGE" | "VIDEO") => void;
  placeholder: string;
  acceptVideo?: boolean;
  uploadFolder?: string;
}) {
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = acceptVideo && file.type.startsWith("video/");
    if (!isImage && !isVideo) return;

    setUploadError("");
    setUploading(true);
    try {
      const folder = uploadFolder ?? "images";
      const url = await uploadFile(file, folder);
      onChange(url);
      setMediaType(isVideo ? "video" : "image");
      onMediaTypeChange?.(isVideo ? "VIDEO" : "IMAGE");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t("admin_form.upload_error"));
    } finally {
      setUploading(false);
    }
  };

  const accept = acceptVideo ? "image/*,video/*" : "image/*";
  const isVideoUrl = (url: string) => /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
  const showAsVideo = mediaType === "video" || (mediaType === null && value && isVideoUrl(value));

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-400">
        {label}
        {required ? " *" : ""}
      </label>
      <label
        className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 transition-colors ${
          uploading ? "cursor-wait border-slate-200 bg-slate-100" : "border-slate-200 bg-slate-50/80 hover:border-slate-300"
        }`}
      >
        <input
          accept={accept}
          className="hidden"
          disabled={uploading}
          onChange={handleFileChange}
          type="file"
        />
        {uploading ? (
          <Loader2 className="mb-2 h-8 w-8 animate-spin text-slate-400" />
        ) : (
          <Upload className="mb-2 h-8 w-8 text-slate-300" />
        )}
        <span className="text-sm font-medium text-slate-500">
          {uploading ? t("admin_form.uploading") : placeholder}
        </span>
        {uploadError ? (
          <span className="mt-1 text-xs text-rose-600">{uploadError}</span>
        ) : value ? (
          showAsVideo ? (
            <video
              className="mt-2 max-h-20 w-full rounded-lg object-cover"
              src={value}
              controls
              muted
              playsInline
            />
          ) : (
            <img
              alt={t("admin_form.preview_alt")}
              className="mt-2 max-h-20 w-full rounded-lg object-cover"
              src={value}
            />
          )
        ) : null}
      </label>
    </div>
  );
}

export function AdminStreamFormPage() {
  const navigate = useNavigate();
  const { streamId } = useParams();

  const { data: festivalData, loading: loadingFestival } = useQuery<{ festival: Festival }>(GET_FESTIVAL_QUERY, {
    variables: { id: streamId },
    skip: !streamId,
  });

  const editingFestival = festivalData?.festival;
  const isEditMode = Boolean(streamId && editingFestival);

  const [form, setForm] = useState<FormState>(defaultForm);

  useEffect(() => {
    if (editingFestival) {
      setForm({
        name: editingFestival.name,
        coverImageUrl: editingFestival.coverImageUrl ?? "",
        conceptMediaUrl: editingFestival.conceptMediaUrl ?? "",
        conceptMediaType: editingFestival.conceptMediaType ?? "IMAGE",
        conceptText: editingFestival.conceptText ?? "",
        rulesText: editingFestival.rulesText ?? "",
        status: editingFestival.status,
      });
    } else if (!streamId) {
      setForm(defaultForm);
    }
  }, [editingFestival, streamId]);

  const [error, setError] = useState("");

  const [createFestival, { loading: creating }] = useMutation(CREATE_FESTIVAL_MUTATION, {
    refetchQueries: [{ query: GET_FESTIVALS_QUERY }],
  });

  const [updateFestival, { loading: updatingFestival }] = useMutation(UPDATE_FESTIVAL_MUTATION, {
    refetchQueries: [{ query: GET_FESTIVALS_QUERY }, { query: GET_FESTIVAL_QUERY, variables: { id: streamId } }],
  });

  const [updateStatus, { loading: updatingStatus }] = useMutation(UPDATE_FESTIVAL_STATUS_MUTATION);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.coverImageUrl.trim()) {
      setError(t("admin_form.name_cover_required"));
      return;
    }

    try {
      if (isEditMode && editingFestival) {
        await updateFestival({
          variables: {
            input: {
              festivalId: editingFestival.id,
              name: form.name.trim(),
              coverImageUrl: form.coverImageUrl,
              conceptMediaType: form.conceptMediaUrl ? form.conceptMediaType : undefined,
              conceptMediaUrl: form.conceptMediaUrl || undefined,
              conceptText: form.conceptText || undefined,
              rulesText: form.rulesText || undefined,
            },
          },
        });
        if (form.status !== editingFestival.status) {
          await updateStatus({
            variables: {
              input: { festivalId: editingFestival.id, newStatus: form.status },
            },
          });
        }
      } else {
        await createFestival({
          variables: {
            input: {
              name: form.name.trim(),
              coverImageUrl: form.coverImageUrl,
              conceptMediaType: form.conceptMediaUrl ? form.conceptMediaType : undefined,
              conceptMediaUrl: form.conceptMediaUrl || undefined,
              conceptText: form.conceptText || undefined,
              rulesText: form.rulesText || undefined,
            },
          },
        });
      }

      navigate("/admin");
    } catch (err: any) {
      setError(err.message || t("admin_form.save_error"));
    }
  };

  const submitting = creating || updatingFestival || updatingStatus;

  return (
    <div className="mx-auto max-w-2xl animate-fade-in px-4 py-5">
      <Link
        to="/admin"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("admin.back")}
      </Link>

      <h1 className="mb-6 text-xl font-black text-slate-800">
        {isEditMode ? t("admin_form.edit_stream") : t("admin_form.create_festival")}
      </h1>

      {isEditMode && loadingFestival ? (
        <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>{t("admin_form.loading")}</span>
        </div>
      ) : (
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        {/* بخش ۱: نام جشنواره + تصویر کاور */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400" htmlFor="name">
                {t("admin_form.festival_name")}
              </label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder={t("admin_form.festival_name_placeholder")}
                className="rounded-xl border-slate-200 bg-slate-50 focus:border-primary-300 focus:ring-primary-300"
              />
            </div>

            <UploadCard
              label={t("admin_form.cover_image")}
              required
              value={form.coverImageUrl}
              onChange={(v) => setForm((prev) => ({ ...prev, coverImageUrl: v }))}
              placeholder={t("admin_form.cover_placeholder")}
            />
          </div>
        </div>

        {/* بخش ۲: توضیح مفهوم + تصویر یا ویدیو مفهوم */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400" htmlFor="conceptText">
                {t("admin_form.concept_text")}
              </label>
              <Textarea
                id="conceptText"
                value={form.conceptText}
                onChange={(e) => setForm((prev) => ({ ...prev, conceptText: e.target.value }))}
                placeholder={t("admin_form.concept_placeholder")}
                rows={4}
                className="rounded-xl border-slate-200 bg-slate-50 focus:border-primary-300 focus:ring-primary-300"
              />
            </div>

            <UploadCard
              label={t("admin_form.concept_media")}
              value={form.conceptMediaUrl}
              onChange={(v) => setForm((prev) => ({ ...prev, conceptMediaUrl: v }))}
              onMediaTypeChange={(t) => setForm((prev) => ({ ...prev, conceptMediaType: t }))}
              placeholder={t("admin_form.upload_placeholder")}
              acceptVideo
              uploadFolder="concept"
            />
          </div>
        </div>

        {/* بخش ۳: قواعد فرم */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400" htmlFor="rulesText">
                {t("admin_form.rules")}
              </label>
              <Textarea
                id="rulesText"
                value={form.rulesText}
                onChange={(e) => setForm((prev) => ({ ...prev, rulesText: e.target.value }))}
                placeholder={t("admin_form.rules_placeholder")}
                rows={4}
                className="rounded-xl border-slate-200 bg-slate-50 focus:border-primary-300 focus:ring-primary-300"
              />
            </div>

            {isEditMode && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">{t("admin_form.status_label")}</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as FestivalStatus }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                >
                  <option value="UNOPENED">{t("admin_form.status_unopened")}</option>
                  <option value="OPEN">{t("admin_form.status_open")}</option>
                  <option value="CLOSED">{t("admin_form.status_closed")}</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {error ? <Alert variant="error">{error}</Alert> : null}

        <div className="grid grid-cols-2 gap-3">
          <Button className="py-3.5 font-bold" disabled={submitting} type="submit">
            {submitting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
            {t("admin_form.save")}
          </Button>
          <Button
            className="py-3.5 font-bold"
            type="button"
            variant="outline"
            onClick={() => navigate("/admin")}
          >
            {t("admin_form.cancel")}
          </Button>
        </div>
      </form>
      )}
    </div>
  );
}
