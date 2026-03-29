import { useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@apollo/client/react";
import { Bug, ChevronLeft, Sparkles, Zap } from "lucide-react";

import {
  GET_LATEST_PUBLISHED_RELEASE_QUERY,
  GET_PUBLISHED_RELEASES_QUERY,
} from "@/graphql/operations";
import { formatDateFa, toPersianDigits } from "@/lib/format";
import { t } from "@/lib/i18n";
import type { Release } from "@/types/models";

const CHANGELOG_SEEN_KEY = "changelog_seen";

function getSeenKey(version: string): string {
  return `${CHANGELOG_SEEN_KEY}_${String(version).replace(/\./g, "_")}`;
}

export function markVersionAsSeen(version?: string | null) {
  if (!version) return;
  try {
    localStorage.setItem(getSeenKey(version), "1");
  } catch {
    // ignore
  }
}

export function hasSeenVersion(version?: string | null): boolean {
  if (!version) return true;
  try {
    return !!localStorage.getItem(getSeenKey(version));
  } catch {
    return true;
  }
}

function ReleaseContent({ release }: { release: Release | null }) {
  if (!release) return null;

  const hasFeatures = release.features?.length > 0;
  const hasImprovements = release.improvements?.length > 0;
  const hasBugFixes = release.bugFixes?.length > 0;

  return (
    <div className="space-y-4">
      {hasFeatures ? (
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-600">
            <Sparkles className="h-4 w-4" />
            {t("changelog.new_features")}
          </h4>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
            {release.features.map((item, index) => (
              <li key={`f-${release.id}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasImprovements ? (
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-600">
            <Zap className="h-4 w-4" />
            {t("changelog.improvements")}
          </h4>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
            {release.improvements.map((item, index) => (
              <li key={`i-${release.id}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasBugFixes ? (
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-600">
            <Bug className="h-4 w-4" />
            {t("changelog.bug_fixes")}
          </h4>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
            {release.bugFixes.map((item, index) => (
              <li key={`b-${release.id}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {!hasFeatures && !hasImprovements && !hasBugFixes ? (
        <p className="text-sm text-slate-500">{t("changelog.no_changes")}</p>
      ) : null}
    </div>
  );
}

interface ChangelogModalProps {
  open: boolean;
  onClose: () => void;
  initialRelease?: Release | null;
}

export function ChangelogModal({ open, onClose, initialRelease }: ChangelogModalProps) {
  const [viewMode, setViewMode] = useState<"current" | "list">("current");

  const { data: latestData } = useQuery<{ latestPublishedRelease: Release | null }>(
    GET_LATEST_PUBLISHED_RELEASE_QUERY,
    { skip: !open },
  );
  const { data: publishedData } = useQuery<{ publishedReleases: Release[] }>(GET_PUBLISHED_RELEASES_QUERY, {
    skip: !open || viewMode !== "list",
  });

  const latestRelease = latestData?.latestPublishedRelease ?? null;
  const displayRelease = initialRelease ?? latestRelease;
  const publishedReleases = publishedData?.publishedReleases ?? [];
  const currentRelease = viewMode === "current" ? displayRelease : null;

  const markAndClose = () => {
    if (displayRelease?.version) {
      markVersionAsSeen(displayRelease.version);
    }
    setViewMode("current");
    onClose();
  };

  if (!open) return null;

  const body = (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(4px)" }}
      dir="rtl"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) markAndClose();
      }}
    >
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-scale-in">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-l from-primary-50 to-white px-5 py-4">
          <h2 className="text-lg font-bold text-slate-800">{t("changelog.title")}</h2>
          {viewMode === "list" ? (
            <button
              type="button"
              onClick={() => setViewMode("current")}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("changelog.back")}
            </button>
          ) : (
            <div className="w-0" />
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {viewMode === "current" ? (
            currentRelease ? (
              <>
                <div className="mb-4 flex items-center justify-between gap-2">
                  <span className="inline-flex rounded-lg bg-primary-100 px-2.5 py-1 text-sm font-medium text-primary-700">
                    {t("changelog.version_prefix")} {toPersianDigits(currentRelease.version)}
                  </span>
                  {(currentRelease.publishedAt || currentRelease.createdAt) && (
                    <span className="text-xs text-slate-500">
                      {formatDateFa(currentRelease.publishedAt || currentRelease.createdAt)}
                    </span>
                  )}
                </div>
                <ReleaseContent release={currentRelease} />
              </>
            ) : (
              <p className="py-8 text-center text-sm text-slate-500">{t("changelog.empty")}</p>
            )
          ) : (
            <div className="space-y-6">
              {publishedReleases.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">{t("changelog.empty")}</p>
              ) : (
                publishedReleases.map((release) => (
                  <div key={release.id} className="border-b border-slate-100 pb-6 last:border-0">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-700">
                        {t("changelog.version_prefix")} {toPersianDigits(release.version)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatDateFa(release.publishedAt || release.createdAt)}
                      </span>
                    </div>
                    <ReleaseContent release={release} />
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-100 px-5 py-4">
          {viewMode === "current" ? (
            <>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                {t("changelog.view_previous")}
              </button>
              <button
                type="button"
                onClick={markAndClose}
                className="rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
              >
                {t("changelog.got_it")}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={markAndClose}
              className="mr-auto rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
            >
              {t("changelog.got_it")}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(body, document.body);
}
