import { useCallback, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { toPersianDigits } from "@/lib/format";
import { t } from "@/lib/i18n";
import { resolveMediaUrl } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload, type FileUploadRef } from "@/components/shared/file-upload";

interface CreateImageModalProps {
  open: boolean;
  onClose: () => void;
  streamName: string;
  onComplete: (urls: string[], title: string, description: string, coverIndex: number) => void;
}

const MAX_DESCRIPTION_LENGTH = 200;

export function CreateImageModal({ open, onClose, streamName, onComplete }: CreateImageModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [imageTitle, setImageTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const fileUploadRef = useRef<FileUploadRef>(null);

  const handleClose = useCallback(() => {
    setStep(1);
    setImageTitle("");
    setPrompt("");
    setSelectedUrls([]);
    setCoverIndex(0);
    onClose();
  }, [onClose]);

  const handleNextStep = useCallback(() => {
    const successFiles = fileUploadRef.current?.getSuccessFiles() ?? [];
    if (successFiles.length > 0) {
      setSelectedUrls(successFiles.map((file) => file.url));
      setCoverIndex(0);
      setStep(2);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedUrls.length > 0 && imageTitle.trim()) {
      onComplete(selectedUrls, imageTitle.trim(), prompt.trim(), coverIndex);
      handleClose();
    }
  }, [onComplete, prompt, imageTitle, selectedUrls, coverIndex, handleClose]);

  const canProceed = step === 1 ? successCount > 0 : imageTitle.trim().length > 0;

  return (
    <Dialog onOpenChange={(next) => !next && handleClose()} open={open}>
      <DialogContent className="max-w-xl rounded-2xl p-5" dir="rtl">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <DialogTitle className="text-right text-base font-bold text-slate-800">
            {t("image_upload.create_title")}
          </DialogTitle>
        </DialogHeader>

        <div className="p-5">
          {step === 1 ? (
            <div className="space-y-5">
              <FileUpload
                ref={fileUploadRef}
                accept="image/*"
                maxFiles={3}
                onSuccessCountChange={setSuccessCount}
              />
              <div className="flex flex-row-reverse items-center gap-2 pt-1">
                <Button
                  disabled={!canProceed}
                  onClick={handleNextStep}
                  className="bg-gradient-to-l from-primary-500 to-primary-600 text-white shadow-primary-200 hover:shadow-lg"
                >
                  {t("image_upload.next_step")}
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  {t("image_upload.cancel_back")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">
                  {t("nav.festival")}: <span className="font-bold text-slate-800">{streamName}</span>
                </p>
              </div>
              {selectedUrls.length > 0 ? (
                <div>
                  <p className="mb-2 text-xs font-semibold text-slate-400">{t("image_upload.cover_select_label")}</p>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedUrls.map((url, index) => {
                      const isSelected = index === coverIndex;
                      return (
                        <button
                          type="button"
                          key={url}
                          onClick={() => setCoverIndex(index)}
                          className={`relative overflow-hidden rounded-2xl border-2 transition-all ${
                            isSelected
                              ? "border-primary-500 ring-2 ring-primary-200"
                              : "border-slate-200 hover:border-primary-300"
                          }`}
                        >
                          <img
                            alt={`${t("image_upload.image_title")} ${index + 1}`}
                            className="aspect-square h-full w-full object-cover"
                            src={resolveMediaUrl(url)}
                          />
                          <span
                            className={`absolute bottom-2 right-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              isSelected ? "bg-primary-500 text-white" : "bg-white/90 text-slate-700"
                            }`}
                          >
                            {isSelected ? t("image_upload.cover_selected") : t("image_upload.set_as_cover")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400" htmlFor="img-title">
                  {t("image_upload.image_title_label")}
                </label>
                <Input
                  id="img-title"
                  placeholder={t("image_upload.image_title_placeholder")}
                  value={imageTitle}
                  onChange={(e) => setImageTitle(e.target.value)}
                  className="rounded-xl text-right"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">
                  {t("image_upload.image_desc_label")}
                </label>
                <Textarea
                  placeholder={t("image_upload.image_desc_placeholder")}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value.slice(0, MAX_DESCRIPTION_LENGTH))}
                  className="min-h-[100px] rounded-xl text-right"
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  rows={4}
                />
                <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                  <p>{t("image_upload.max_200_chars")}</p>
                  <span>
                    {toPersianDigits(prompt.length)} / {toPersianDigits(MAX_DESCRIPTION_LENGTH)}
                  </span>
                </div>
              </div>
              <div className="flex flex-row-reverse items-center gap-2 pt-1">
                <Button
                  disabled={!canProceed}
                  onClick={handleSubmit}
                  className="bg-gradient-to-l from-primary-500 to-primary-600 text-white"
                >
                  {t("image_upload.submit_image")}
                </Button>
                <Button variant="outline" onClick={() => setStep(1)}>
                  {t("image_upload.prev_step")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
