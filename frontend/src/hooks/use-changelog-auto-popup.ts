import { useEffect, useRef } from "react";
import { useQuery } from "@apollo/client/react";

import { GET_LATEST_PUBLISHED_RELEASE_QUERY } from "@/graphql/operations";
import { hasSeenVersion } from "@/components/changelog-modal";
import type { Release } from "@/types/models";

export function useChangelogAutoPopup(
  isLoggedIn: boolean,
  openChangelog: (release?: Release | null) => void,
) {
  const hasCheckedRef = useRef(false);

  const { data } = useQuery<{ latestPublishedRelease: Release | null }>(GET_LATEST_PUBLISHED_RELEASE_QUERY, {
    skip: !isLoggedIn,
    fetchPolicy: "cache-first",
  });

  const latestRelease = data?.latestPublishedRelease ?? null;

  useEffect(() => {
    if (!isLoggedIn || hasCheckedRef.current || !latestRelease?.version) return;

    hasCheckedRef.current = true;
    if (!hasSeenVersion(latestRelease.version)) {
      openChangelog();
    }
  }, [isLoggedIn, latestRelease?.version, openChangelog]);
}
