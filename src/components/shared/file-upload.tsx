import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type ChangeEvent } from "react";
import { AlertCircle, CheckCircle, Eye, RotateCcw, Trash2, Upload, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatNumberFa } from "@/lib/format";

const MAX_FILE_SIZE_MB = 10;

interface UploadedFile {
  id: string;
  file: File;
  url: string;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
}

export interface FileUploadRef {
  getSuccessFiles: () => UploadedFile[];
}

interface FileUploadProps {
  maxFiles?: number;
  accept?: string;
  label?: string;
  onFilesChange?: (files: File[]) => void;
  onSuccessCountChange?: (count: number) => void;
  className?: string;
}

export const FileUpload = forwardRef<FileUploadRef, FileUploadProps>(function FileUpload({
  maxFiles = 3,
  accept = "image/*",
  className,
  onSuccessCountChange,
}, ref) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = useCallback((entry: UploadedFile) => {
    const shouldFail = Math.random() < 0.15;
    return new Promise<string>((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 8;
        const done = progress >= 100 || (shouldFail && progress >= 80);
        const finalStatus: "uploading" | "done" | "error" =
          done && shouldFail ? "error" : done ? "done" : "uploading";
        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? {
                  ...f,
                  progress: done ? 100 : progress,
                  status: finalStatus,
                  error:
                    finalStatus === "error"
                      ? "متاسفانه آپلود انجام نشد. لطفا اتصال خود را چک کرده و دوباره امتحان کنید."
                      : undefined,
                }
              : f,
          ),
        );
        if (done) {
          clearInterval(interval);
          if (shouldFail) reject(new Error("Upload failed"));
          else resolve(entry.url);
        }
      }, 100);
    });
  }, []);

  const processFile = useCallback(
    (file: File): UploadedFile | null => {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return null;
      if (!file.type.startsWith("image/")) return null;

      const id = crypto.randomUUID();
      const url = URL.createObjectURL(file);
      const entry: UploadedFile = {
        id,
        file,
        url,
        progress: 0,
        status: "uploading",
      };
      setFiles((prev) => {
        const next = [...prev, entry].slice(-maxFiles);
        simulateUpload(entry);
        return next;
      });
      return entry;
    },
    [maxFiles, simulateUpload],
  );

  const handleFiles = useCallback(
    (fileList: FileList) => {
      Array.from(fileList).forEach((file) => processFile(file));
    },
    [processFile],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files;
      if (selected) handleFiles(selected);
      e.target.value = "";
    },
    [handleFiles],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const entry = prev.find((f) => f.id === id);
      if (entry?.url) URL.revokeObjectURL(entry.url);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const retryFile = useCallback(
    (id: string) => {
      const entry = files.find((f) => f.id === id);
      if (entry) {
        removeFile(id);
        processFile(entry.file);
      }
    },
    [files, processFile, removeFile],
  );

  const successFiles = files.filter((f) => f.status === "done");

  useEffect(() => {
    onSuccessCountChange?.(successFiles.length);
  }, [successFiles.length, onSuccessCountChange]);

  useImperativeHandle(ref, () => ({
    getSuccessFiles: () => successFiles,
  }), [successFiles]);

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
          isDragOver ? "border-primary-400 bg-primary-50" : "border-slate-200 hover:border-primary-300 hover:bg-slate-50",
          files.length >= maxFiles && "pointer-events-none opacity-50",
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          accept={accept}
          className="hidden"
          multiple
          onChange={handleChange}
          type="file"
        />
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
            <Upload className="h-6 w-6 text-primary-500" />
          </div>
          <div>
            <p className="text-sm text-slate-700">
              فایل را رها کنید یا{" "}
              <span className="font-medium text-primary-500">از اینجا انتخاب کنید</span>
            </p>
            <p className="mt-1 text-xs text-slate-400">
              شما حداکثر {formatNumberFa(maxFiles)} عکس می‌توانید بارگذاری کنید
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((entry) => (
            <div
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm"
              key={entry.id}
            >
              {entry.status === "done" ? (
                <>
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                  <span className="min-w-0 flex-1 truncate text-right text-sm font-medium text-slate-700">
                    {entry.file.name}
                  </span>
                  <button
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(entry.url);
                    }}
                    title="مشاهده"
                    type="button"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    className="rounded p-1.5 text-slate-400 hover:bg-rose-100 hover:text-rose-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(entry.id);
                    }}
                    title="حذف"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              ) : entry.status === "error" ? (
                <>
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-500" />
                  <div className="min-w-0 flex-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full w-full bg-rose-500" />
                    </div>
                    <p className="mt-1 truncate text-right text-xs text-rose-600">{entry.error}</p>
                  </div>
                  <button
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      retryFile(entry.id);
                    }}
                    title="تلاش مجدد"
                    type="button"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    className="rounded p-1.5 text-slate-400 hover:bg-rose-100 hover:text-rose-600"
                    onClick={(e) => {
                      e.stopPropagation();
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
                      e.stopPropagation();
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
      )}
    </div>
  );
});
