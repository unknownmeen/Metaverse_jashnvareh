import { useCallback, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload, type FileUploadRef } from "@/components/shared/file-upload";

interface SelectedFile {
  url: string;
}

interface CreateImageModalProps {
  open: boolean;
  onClose: () => void;
  streamName: string;
  onComplete: (url: string, title: string, description: string) => void;
}

export function CreateImageModal({ open, onClose, streamName, onComplete }: CreateImageModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [imageTitle, setImageTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [successCount, setSuccessCount] = useState(0);
  const fileUploadRef = useRef<FileUploadRef>(null);

  const handleClose = useCallback(() => {
    setStep(1);
    setImageTitle("");
    setPrompt("");
    setSelectedFile(null);
    onClose();
  }, [onClose]);

  const handleNextStep = useCallback(() => {
    const successFiles = fileUploadRef.current?.getSuccessFiles() ?? [];
    const first = successFiles[0];
    if (first) {
      setSelectedFile({ url: first.url });
      setStep(2);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedFile && imageTitle.trim()) {
      onComplete(selectedFile.url, imageTitle.trim(), prompt.trim());
      handleClose();
    }
  }, [onComplete, prompt, imageTitle, selectedFile, handleClose]);

  const canProceed = step === 1 ? successCount > 0 : imageTitle.trim().length > 0;

  return (
    <Dialog onOpenChange={(next) => !next && handleClose()} open={open}>
      <DialogContent className="max-w-xl rounded-2xl p-5" dir="rtl">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <DialogTitle className="text-right text-base font-bold text-slate-800">
            ایجاد تصویر جدید
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
                  مرحله بعد
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  لغو و بازگشت
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">
                  جشنواره: <span className="font-bold text-slate-800">{streamName}</span>
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400" htmlFor="img-title">
                  نام عکس *
                </label>
                <Input
                  id="img-title"
                  placeholder="نامی برای عکس خود انتخاب کنید..."
                  value={imageTitle}
                  onChange={(e) => setImageTitle(e.target.value)}
                  className="rounded-xl text-right"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">
                  توضیحات تصویر
                </label>
                <Textarea
                  placeholder="توضیحاتی درباره تصویر خود بنویسید..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px] rounded-xl text-right"
                  rows={4}
                />
                <p className="mt-1 text-xs text-slate-400">حداکثر ۲۰۰ کلمه</p>
              </div>
              <div className="flex flex-row-reverse items-center gap-2 pt-1">
                <Button
                  disabled={!canProceed}
                  onClick={handleSubmit}
                  className="bg-gradient-to-l from-primary-500 to-primary-600 text-white"
                >
                  ارسال تصویر
                </Button>
                <Button variant="outline" onClick={() => setStep(1)}>
                  مرحله قبل
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
