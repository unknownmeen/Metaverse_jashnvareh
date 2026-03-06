import { type FormEvent, useState } from "react";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client/react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GET_FESTIVAL_QUERY, GET_FESTIVALS_QUERY, CREATE_FESTIVAL_MUTATION, UPDATE_FESTIVAL_STATUS_MUTATION } from "@/graphql/operations";
import { t } from "@/lib/i18n";
import type { Festival, FestivalStatus } from "@/types/models";

interface FormState {
  name: string;
  coverImageUrl: string;
  conceptMediaUrl: string;
  conceptText: string;
  rulesText: string;
  status: FestivalStatus;
}

const defaultForm: FormState = {
  name: "",
  coverImageUrl: "",
  conceptMediaUrl: "",
  conceptText: "",
  rulesText: "",
  status: "OPEN",
};

function UploadCard({
  label,
  required,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      onChange(url);
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-400">
        {label}
        {required ? " *" : ""}
      </label>
      <label className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-4 transition-colors hover:border-slate-300">
        <input
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          type="file"
        />
        <Upload className="mb-2 h-8 w-8 text-slate-300" />
        <span className="text-sm font-medium text-slate-500">{placeholder}</span>
        {value ? (
          <img
            alt={t("admin_form.preview_alt")}
            className="mt-2 max-h-20 rounded-lg object-cover"
            src={value}
          />
        ) : null}
      </label>
    </div>
  );
}

export function AdminStreamFormPage() {
  const navigate = useNavigate();
  const { streamId } = useParams();

  const { data: festivalData } = useQuery<{ festival: Festival }>(GET_FESTIVAL_QUERY, {
    variables: { id: streamId },
    skip: !streamId,
  });

  const editingFestival = festivalData?.festival;
  const isEditMode = Boolean(streamId && editingFestival);

  const [form, setForm] = useState<FormState>(() => {
    if (editingFestival) {
      return {
        name: editingFestival.name,
        coverImageUrl: editingFestival.coverImageUrl ?? "",
        conceptMediaUrl: editingFestival.conceptMediaUrl ?? "",
        conceptText: editingFestival.conceptText ?? "",
        rulesText: editingFestival.rulesText ?? "",
        status: editingFestival.status,
      };
    }
    return defaultForm;
  });

  const [error, setError] = useState("");

  const [createFestival, { loading: creating }] = useMutation(CREATE_FESTIVAL_MUTATION, {
    refetchQueries: [{ query: GET_FESTIVALS_QUERY }],
  });

  const [updateStatus, { loading: updating }] = useMutation(UPDATE_FESTIVAL_STATUS_MUTATION);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.coverImageUrl.trim()) {
      setError(t("admin_form.name_cover_required"));
      return;
    }

    try {
      if (isEditMode && editingFestival) {
        // Update status if changed
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

  const submitting = creating || updating;

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
              placeholder={t("admin_form.upload_placeholder")}
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
    </div>
  );
}
