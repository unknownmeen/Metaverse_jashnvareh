import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Loader2, Plus, X } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toPersianDigits } from "@/lib/format";
import { t } from "@/lib/i18n";
import { resolveMediaUrl, uploadFile } from "@/lib/upload";

interface EditImageModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (urls: string[], title: string, description: string, coverIndex: number) => Promise<void>;
  streamName: string;
  initialTitle: string;
  initialDescription: string;
  initialUrls: string[];
  initialCoverIndex?: number;
}

const MAX_FILES = 3;
const MAX_FILE_SIZE_MB = 10;
const MAX_DESCRIPTION_LENGTH = 200;

export function EditImageModal({
  open,
  onClose,
  onSave,
  streamName,
  initialTitle,
  initialDescription,
  initialUrls,
  initialCoverIndex = 0,
}: EditImageModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageTitle, setImageTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [selectedUrls, setSelectedUrls] = useState<string[]>(initialUrls);
  const [coverIndex, setCoverIndex] = useState(initialCoverIndex);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }
    setImageTitle(initialTitle);
    setDescription(initialDescription);
    setSelectedUrls(initialUrls);
    setCoverIndex(Math.min(initialCoverIndex, Math.max(initialUrls.length - 1, 0)));
    setUploading(false);
    setSaving(false);
    setUploadError("");
    setSaveError("");
  }, [open, initialTitle, initialDescription, initialUrls, initialCoverIndex]);

  const removeImage = (index: number) => {
    if (selectedUrls.length <= 1) {
      return;
    }
    setSelectedUrls((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      if (next.length === 0) {
        setCoverIndex(0);
      } else if (index === coverIndex) {
        setCoverIndex(0);
      } else if (index < coverIndex) {
        setCoverIndex((current) => Math.max(current - 1, 0));
      }
      return next;
    });
  };

  const handleFilesSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0 || uploading || selectedUrls.length >= MAX_FILES) {
      return;
    }

    setUploadError("");
    const remainingSlots = MAX_FILES - selectedUrls.length;
    const queue = files.slice(0, remainingSlots);
    const nextUrls: string[] = [];

    setUploading(true);
    try {
      for (const file of queue) {
        if (!file.type.startsWith("image/")) {
          setUploadError(t("image_upload.only_image_files"));
          continue;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          setUploadError(t("upload.file_too_large"));
          continue;
        }

        const uploadedUrl = await uploadFile(file, "images");
        nextUrls.push(uploadedUrl);
      }

      if (nextUrls.length > 0) {
        setSelectedUrls((prev) => [...prev, ...nextUrls]);
      }
    } catch (error: unknown) {
      setUploadError(error instanceof Error ? error.message : t("image_upload.upload_failed"));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!imageTitle.trim() || selectedUrls.length === 0 || saving || uploading) {
      return;
    }
    setSaveError("");
    setSaving(true);
    try {
      await onSave(selectedUrls, imageTitle.trim(), description.trim(), coverIndex);
      onClose();
    } catch (error: unknown) {
      setSaveError(error instanceof Error ? error.message : t("image_upload.edit_error"));
    } finally {
      setSaving(false);
    }
  };

  const canAddMore = selectedUrls.length < MAX_FILES && !uploading;
  const canSave = selectedUrls.length > 0 && imageTitle.trim().length > 0 && !saving && !uploading;

  return (
    <Dialog onOpenChange={(next) => !next && !saving && !uploading && onClose()} open={open}>
      <DialogContent className="max-w-xl rounded-2xl p-5" dir="rtl">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <DialogTitle className="text-right text-base font-bold text-slate-800">
            {t("image_upload.edit_title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 p-5">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">
              {t("nav.festival")}: <span className="font-bold text-slate-800">{streamName}</span>
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-slate-400">{t("image_upload.cover_select_label")}</p>
            <div className="grid grid-cols-3 gap-3">
              {selectedUrls.map((url, index) => {
                const isSelected = index === coverIndex;
                const canRemove = selectedUrls.length > 1;
                return (
                  <div
                    key={`${url}-${index}`}
                    className={`relative overflow-hidden rounded-2xl border-2 transition-all ${
                      isSelected
                        ? "border-primary-500 ring-2 ring-primary-200"
                        : "border-slate-200 hover:border-primary-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setCoverIndex(index)}
                      className="block h-full w-full"
                    >
                      <img
                        alt={`${t("image_upload.image_title")} ${index + 1}`}
                        className="aspect-square h-full w-full object-cover"
                        src={resolveMediaUrl(url)}
                      />
                    </button>
                    <span
                      className={`pointer-events-none absolute bottom-2 right-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        isSelected ? "bg-primary-500 text-white" : "bg-white/90 text-slate-700"
                      }`}
                    >
                      {isSelected ? t("image_upload.cover_selected") : t("image_upload.set_as_cover")}
                    </span>
                    {canRemove ? (
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute left-2 top-2 rounded-full bg-black/55 p-1 text-white transition hover:bg-black/70"
                        title={t("image_upload.delete")}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                );
              })}
              {canAddMore ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
                >
                  <div className="flex flex-col items-center gap-2">
                    {uploading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Plus className="h-6 w-6" />
                    )}
                    <span className="text-xs font-semibold">{t("image_upload.add_image")}</span>
                  </div>
                </button>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              multiple
              onChange={(event) => void handleFilesSelected(event)}
              type="file"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400" htmlFor="edit-img-title">
              {t("image_upload.image_title_label")}
            </label>
            <Input
              id="edit-img-title"
              placeholder={t("image_upload.image_title_placeholder")}
              value={imageTitle}
              onChange={(event) => setImageTitle(event.target.value)}
              className="rounded-xl text-right"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400" htmlFor="edit-img-description">
              {t("image_upload.image_desc_label")}
            </label>
            <Textarea
              id="edit-img-description"
              placeholder={t("image_upload.image_desc_placeholder")}
              value={description}
              onChange={(event) => setDescription(event.target.value.slice(0, MAX_DESCRIPTION_LENGTH))}
              className="min-h-[100px] rounded-xl text-right"
              maxLength={MAX_DESCRIPTION_LENGTH}
              rows={4}
            />
            <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
              <p>{t("image_upload.max_200_chars")}</p>
              <span>
                {toPersianDigits(description.length)} / {toPersianDigits(MAX_DESCRIPTION_LENGTH)}
              </span>
            </div>
          </div>

          {uploadError ? <Alert variant="error">{uploadError}</Alert> : null}
          {saveError ? <Alert variant="error">{saveError}</Alert> : null}

          <div className="flex flex-row-reverse items-center gap-2 pt-1">
            <Button
              disabled={!canSave}
              onClick={() => void handleSave()}
              className="bg-gradient-to-l from-primary-500 to-primary-600 text-white"
            >
              {saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
              {saving ? t("image_upload.saving") : t("image_upload.save_changes")}
            </Button>
            <Button variant="outline" disabled={saving || uploading} onClick={onClose}>
              {t("image_upload.cancel_back")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
