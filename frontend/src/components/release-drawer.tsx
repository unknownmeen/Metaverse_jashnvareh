import { type FormEvent, useCallback, useEffect, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Loader2, Plus, Trash2, X } from "lucide-react";

import {
  CREATE_RELEASE_MUTATION,
  GET_RELEASES_QUERY,
  UPDATE_RELEASE_MUTATION,
} from "@/graphql/operations";
import { toEnglishDigits } from "@/lib/format";
import { t } from "@/lib/i18n";
import type { Release } from "@/types/models";

interface ReleaseFormItem {
  id: string;
  value: string;
}

interface ReleaseDrawerProps {
  open: boolean;
  onClose: () => void;
  editingRelease: Release | null;
  onSuccess?: () => void;
}

function DynamicList({
  items,
  onChange,
  placeholder,
}: {
  items: ReleaseFormItem[];
  onChange: (next: ReleaseFormItem[]) => void;
  placeholder: string;
}) {
  const addItem = useCallback(() => {
    onChange([...items, { id: crypto.randomUUID(), value: "" }]);
  }, [items, onChange]);

  const removeItem = useCallback(
    (id: string) => {
      onChange(items.filter((item) => item.id !== id));
    },
    [items, onChange],
  );

  const updateItem = useCallback(
    (id: string, value: string) => {
      onChange(items.map((item) => (item.id === id ? { ...item, value } : item)));
    },
    [items, onChange],
  );

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex gap-2">
          <input
            type="text"
            value={item.value}
            onChange={(e) => updateItem(item.id, e.target.value)}
            placeholder={placeholder}
            className="h-10 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
            title={t("user_management.delete")}
            aria-label={t("user_management.delete")}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-primary-50 hover:text-primary-600"
      >
        <Plus className="h-4 w-4" />
        {t("super_admin.add_item")}
      </button>
    </div>
  );
}

export function ReleaseDrawer({ open, onClose, editingRelease, onSuccess }: ReleaseDrawerProps) {
  const [version, setVersion] = useState(editingRelease?.version ?? "");
  const [published, setPublished] = useState(editingRelease?.published ?? false);
  const [features, setFeatures] = useState<ReleaseFormItem[]>(
    () => (editingRelease?.features ?? []).map((value) => ({ id: crypto.randomUUID(), value })),
  );
  const [improvements, setImprovements] = useState<ReleaseFormItem[]>(
    () => (editingRelease?.improvements ?? []).map((value) => ({ id: crypto.randomUUID(), value })),
  );
  const [bugFixes, setBugFixes] = useState<ReleaseFormItem[]>(
    () => (editingRelease?.bugFixes ?? []).map((value) => ({ id: crypto.randomUUID(), value })),
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setVersion(editingRelease?.version ?? "");
    setPublished(editingRelease?.published ?? false);
    setFeatures((editingRelease?.features ?? []).map((value) => ({ id: crypto.randomUUID(), value })));
    setImprovements((editingRelease?.improvements ?? []).map((value) => ({ id: crypto.randomUUID(), value })));
    setBugFixes((editingRelease?.bugFixes ?? []).map((value) => ({ id: crypto.randomUUID(), value })));
    setError("");
  }, [open, editingRelease]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const [createRelease, { loading: creating }] = useMutation(CREATE_RELEASE_MUTATION, {
    refetchQueries: [{ query: GET_RELEASES_QUERY }],
  });
  const [updateRelease, { loading: updating }] = useMutation(UPDATE_RELEASE_MUTATION, {
    refetchQueries: [{ query: GET_RELEASES_QUERY }],
  });

  const loading = creating || updating;

  const resetForm = () => {
    setVersion(editingRelease?.version ?? "");
    setPublished(editingRelease?.published ?? false);
    setFeatures((editingRelease?.features ?? []).map((value) => ({ id: crypto.randomUUID(), value })));
    setImprovements((editingRelease?.improvements ?? []).map((value) => ({ id: crypto.randomUUID(), value })));
    setBugFixes((editingRelease?.bugFixes ?? []).map((value) => ({ id: crypto.randomUUID(), value })));
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const cleanVersion = toEnglishDigits(version).trim();
    if (!/^\d+\.\d+\.\d+$/.test(cleanVersion)) {
      setError("شماره نسخه باید به فرمت X.Y.Z باشد (مثال: 1.2.0)");
      return;
    }

    const toArray = (items: ReleaseFormItem[]) => items.map((item) => item.value.trim()).filter(Boolean);

    try {
      if (editingRelease) {
        await updateRelease({
          variables: {
            id: editingRelease.id,
            input: {
              version: cleanVersion,
              published,
              features: toArray(features),
              improvements: toArray(improvements),
              bugFixes: toArray(bugFixes),
            },
          },
        });
      } else {
        await createRelease({
          variables: {
            input: {
              version: cleanVersion,
              published,
              features: toArray(features),
              improvements: toArray(improvements),
              bugFixes: toArray(bugFixes),
            },
          },
        });
      }

      handleClose();
      onSuccess?.();
    } catch (mutationError: unknown) {
      if (mutationError instanceof Error) {
        setError(mutationError.message || t("user_management.error"));
      } else {
        setError(t("user_management.error"));
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex" dir="rtl">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={handleClose} />

      <div className="absolute left-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur-md">
          <h2 className="text-lg font-bold text-slate-800">
            {editingRelease ? `${t("common.edit")} نسخه` : t("super_admin.add_release")}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl p-2 transition-colors hover:bg-slate-100"
            title={t("common.close")}
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                {t("super_admin.version_label")} *
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder={t("super_admin.version_placeholder")}
                dir="ltr"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-600">{t("super_admin.publish_immediately")}</label>
              <button
                type="button"
                role="switch"
                aria-checked={published}
                onClick={() => setPublished((prev) => !prev)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${published ? "bg-primary-500" : "bg-slate-200"}`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${
                    published ? "end-1 start-auto" : "start-1 end-auto"
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                ✨ {t("changelog.new_features")}
              </label>
              <DynamicList items={features} onChange={setFeatures} placeholder="ویژگی جدید..." />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                🚀 {t("changelog.improvements")}
              </label>
              <DynamicList items={improvements} onChange={setImprovements} placeholder="بهبود..." />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                🐛 {t("changelog.bug_fixes")}
              </label>
              <DynamicList items={bugFixes} onChange={setBugFixes} placeholder="رفع باگ..." />
            </div>

            <div className="flex gap-3 border-t border-slate-100 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t("common.save_changes")}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex flex-1 items-center justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
              >
                {t("common.cancel")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
