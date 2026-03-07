import { useCallback, useState } from "react";
import { CloudUpload, Eye, RotateCcw, Trash2, X } from "lucide-react";

import { t } from "@/lib/i18n";
import { uploadFile } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILES = 3;

type FileStatus = "uploading" | "success" | "error";

interface FileEntry {
  id: string;
  file: File;
  url: string;
  status: FileStatus;
  progress: number;
  error?: string;
}

interface ImageUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (url: string, title: string, description: string) => void;
}

export function ImageUploadModal({ open, onOpenChange, onComplete }: ImageUploadModalProps) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [step, setStep] = useState<"upload" | "metadata">("upload");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const reset = useCallback(() => {
    setFiles([]);
    setStep("upload");
    setTitle("");
    setDescription("");
  }, []);

  const handleClose = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        reset();
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange, reset],
  );

  const processFile = useCallback(
    async (file: File): Promise<FileEntry | null> => {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return null;
      if (!file.type.startsWith("image/")) return null;

      const id = crypto.randomUUID();
      const entry: FileEntry = {
        id,
        file,
        url: "",
        status: "uploading",
        progress: 0,
      };

      setFiles((prev) => [...prev, entry].slice(-MAX_FILES));

      try {
        const url = await uploadFile(file, "images");
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, url, progress: 100, status: "success" } : f,
          ),
        );
        return { ...entry, url, progress: 100, status: "success" };
      } catch (err) {
        const msg = err instanceof Error ? err.message : t("image_upload.upload_failed");
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, status: "error", error: msg } : f,
          ),
        );
        return null;
      }
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      Array.from(e.dataTransfer.files).forEach((file) => void processFile(file));
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files;
      if (selected) {
        Array.from(selected).forEach((file) => void processFile(file));
      }
      e.target.value = "";
    },
    [processFile],
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const retryFile = useCallback(
    (entry: FileEntry) => {
      removeFile(entry.id);
      void processFile(entry.file);
    },
    [processFile, removeFile],
  );

  const goToMetadata = useCallback(() => {
    const success = files.find((f) => f.status === "success");
    if (success) {
      setTitle(success.file.name.replace(/\.[^/.]+$/, ""));
      setStep("metadata");
    }
  }, [files]);

  const handleSave = useCallback(() => {
    const success = files.find((f) => f.status === "success");
    if (success) {
      onComplete(success.url, title.trim() || success.file.name, description.trim());
      handleClose(false);
    }
  }, [files, title, description, onComplete, handleClose]);

  const successCount = files.filter((f) => f.status === "success").length;
  const canProceed = successCount > 0;

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent className="max-w-md rounded-3xl p-6" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-right">{t("image_upload.create_title")}</DialogTitle>
          <DialogDescription className="text-right">
            {step === "upload"
              ? t("image_upload.drag_hint")
              : t("image_upload.form_hint")}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" ? (
          <>
            <div
              className={`flex min-h-[180px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-colors ${
                dragActive ? "border-primary-400 bg-primary-50/50" : "border-slate-200 bg-slate-50/80"
              }`}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                accept="image/*"
                className="hidden"
                id="image-upload-input"
                multiple
                onChange={handleFileSelect}
                type="file"
              />
              <label className="flex cursor-pointer flex-col items-center gap-2 text-center" htmlFor="image-upload-input">
                <CloudUpload className="h-14 w-14 text-primary-500" />
                <span className="text-sm font-medium text-slate-600">
                  {t("image_upload.drag_or_click")}{" "}
                  <span className="text-primary-600 underline decoration-primary-500">{t("image_upload.click_to_select")}</span>
                </span>
                <span className="text-xs text-slate-400">{t("image_upload.max_size")}</span>
                <span className="text-xs text-slate-400">{t("image_upload.max_three")}</span>
              </label>
            </div>

            {files.length > 0 ? (
              <div className="space-y-2">
                {files.map((entry) => (
                  <div
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm"
                    key={entry.id}
                  >
                    {entry.status === "success" ? (
                      <>
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                          ✓
                        </span>
                        <span className="min-w-0 flex-1 truncate text-right text-sm font-medium text-slate-700">
                          {entry.file.name}
                        </span>
                        <button
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                          onClick={() => window.open(entry.url)}
                          title={t("image_upload.view")}
                          type="button"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded p-1.5 text-slate-400 hover:bg-rose-100 hover:text-rose-600"
                          onClick={(e) => {
                            e.preventDefault();
                            removeFile(entry.id);
                          }}
                          title={t("image_upload.delete")}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    ) : entry.status === "error" ? (
                      <>
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                          <X className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                            <div className="h-full w-full bg-rose-500" />
                          </div>
                          <p className="mt-1 truncate text-right text-xs text-rose-600">{entry.error}</p>
                        </div>
                        <button
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-200"
                          onClick={(e) => {
                            e.preventDefault();
                            retryFile(entry);
                          }}
                          title={t("image_upload.retry")}
                          type="button"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded p-1.5 text-slate-400 hover:bg-rose-100 hover:text-rose-600"
                          onClick={(e) => {
                            e.preventDefault();
                            removeFile(entry.id);
                          }}
                          type="button"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-slate-600">
                          {Math.round(entry.progress)}٪
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full bg-primary-500 transition-all duration-300"
                            style={{ width: `${entry.progress}%` }}
                          />
                        </div>
                        <button
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-200"
                          onClick={(e) => {
                            e.preventDefault();
                            removeFile(entry.id);
                          }}
                          type="button"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : null}

            <DialogFooter className="flex flex-row-reverse gap-3 sm:flex-row-reverse">
              <Button
                className="bg-gradient-to-l from-primary-500 to-primary-600 text-white shadow-primary-200 hover:shadow-lg"
                disabled={!canProceed}
                onClick={goToMetadata}
              >
                {t("image_upload.next_step")}
              </Button>
              <Button onClick={() => handleClose(false)} variant="outline">
                {t("image_upload.cancel_back")}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-4 text-right">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400" htmlFor="img-title">
                  {t("image_upload.image_title")}
                </label>
                <Input
                  id="img-title"
                  placeholder="عنوان تصویر را وارد کنید"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl text-right"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400" htmlFor="img-desc">
                  توضیحات مختصر
                </label>
                <Textarea
                  id="img-desc"
                  placeholder="توضیحات تصویر را وارد کنید"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-xl text-right"
                />
                <p className="mt-1 text-xs text-slate-400">حداکثر ۲۰۰ کلمه</p>
              </div>
            </div>

            <DialogFooter className="flex flex-row-reverse gap-3 sm:flex-row-reverse">
              <Button
                className="bg-gradient-to-l from-primary-500 to-primary-600 text-white"
                onClick={handleSave}
              >
                ایجاد
              </Button>
              <Button onClick={() => setStep("upload")} variant="outline">
                لغو
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
