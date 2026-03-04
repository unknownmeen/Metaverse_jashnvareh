import { type FormEvent, useMemo, useState } from "react";
import { ArrowLeft, Upload } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAppStore } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { StreamInput, StreamStatus } from "@/types/models";

const defaultForm: StreamInput = {
  name: "",
  coverUrl: "",
  conceptMediaType: "image",
  conceptMediaUrl: "",
  conceptDescription: "",
  formRules: "",
  status: "opened",
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
            alt="پیش‌نمایش"
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
  const { streams, createStream, updateStream } = useAppStore();

  const editingStream = useMemo(() => streams.find((item) => item.id === streamId), [streamId, streams]);
  const [form, setForm] = useState<StreamInput>(() => (editingStream ? { ...editingStream } : defaultForm));
  const [error, setError] = useState("");

  const isEditMode = Boolean(editingStream);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.coverUrl.trim()) {
      setError("نام جریان و عکس کاور الزامی است.");
      return;
    }

    if (isEditMode && editingStream) {
      updateStream(editingStream.id, form);
    } else {
      createStream(form);
    }

    navigate("/admin");
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in px-4 py-5">
      <Link
        to="/admin"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4" />
        بازگشت به مدیریت
      </Link>

      <h1 className="mb-6 text-xl font-black text-slate-800">
        {isEditMode ? "ویرایش جریان" : "ایجاد جشنواره جدید"}
      </h1>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400" htmlFor="name">
                نام جشنواره *
              </label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="نام جشنواره را وارد کنید"
                className="rounded-xl border-slate-200 bg-slate-50 focus:border-primary-300 focus:ring-primary-300"
              />
            </div>

            <UploadCard
              label="تصویر کاور"
              required
              value={form.coverUrl}
              onChange={(v) => setForm((prev) => ({ ...prev, coverUrl: v }))}
              placeholder="آپلود تصویر کاور"
            />

            <UploadCard
              label="تصویر یا ویدیو مفهوم (اختیاری)"
              value={form.conceptMediaUrl ?? ""}
              onChange={(v) => setForm((prev) => ({ ...prev, conceptMediaUrl: v }))}
              placeholder="آپلود فایل"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400" htmlFor="conceptDescription">
                توضیح مفهوم
              </label>
              <Textarea
                id="conceptDescription"
                value={form.conceptDescription}
                onChange={(e) => setForm((prev) => ({ ...prev, conceptDescription: e.target.value }))}
                placeholder="توضیحات مربوط به مفهوم جشنواره"
                rows={4}
                className="rounded-xl border-slate-200 bg-slate-50 focus:border-primary-300 focus:ring-primary-300"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400" htmlFor="formRules">
                قواعد فرم
              </label>
              <Textarea
                id="formRules"
                value={form.formRules}
                onChange={(e) => setForm((prev) => ({ ...prev, formRules: e.target.value }))}
                placeholder="قوانین و مقررات جشنواره را وارد کنید"
                rows={4}
                className="rounded-xl border-slate-200 bg-slate-50 focus:border-primary-300 focus:ring-primary-300"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400">وضعیت جشنواره</label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((prev) => ({ ...prev, status: v as StreamStatus }))}
              >
                <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="opened">باز</SelectItem>
                  <SelectItem value="finished">پایان یافته</SelectItem>
                  <SelectItem value="not_opened">شروع نشده</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {error ? <p className="rounded-xl bg-rose-50 p-2 text-sm text-rose-600">{error}</p> : null}

        <div className="grid grid-cols-2 gap-3">
          <Button className="py-3.5 font-bold" type="submit">
            ذخیره تغییرات
          </Button>
          <Button
            className="py-3.5 font-bold"
            type="button"
            variant="outline"
            onClick={() => navigate("/admin")}
          >
            انصراف
          </Button>
        </div>
      </form>
    </div>
  );
}
