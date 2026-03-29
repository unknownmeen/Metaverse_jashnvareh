import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@apollo/client/react";

import { GET_ME_QUERY, LOGIN_MUTATION } from "@/graphql/operations";
import { apolloClient } from "@/graphql/apollo-client";
import type { User } from "@/types/models";
import type { Release } from "@/types/models";

// ─── Auth Token helpers ──────────────────────────────────────

const TOKEN_KEY = "auth_token";

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── Context Interface ──────────────────────────────────────

interface AppStoreValue {
  currentUser: User | null;
  loading: boolean;
  showChangelogModal: boolean;
  changelogInitialRelease: Release | null;
  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  openChangelog: (release?: Release | null) => void;
  closeChangelog: () => void;
}

const AppStoreContext = createContext<AppStoreValue | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(!!getStoredToken());
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const [changelogInitialRelease, setChangelogInitialRelease] = useState<Release | null>(null);
  const authResolvedRef = useRef(false);

  // Fetch user on mount if token exists
  const { data: meData, loading: meLoading, error: meError } = useQuery<{ me: User | null }>(GET_ME_QUERY, {
    skip: !getStoredToken(),
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (!getStoredToken()) return;
    if (meError) {
      authResolvedRef.current = true;
      clearStoredToken();
      setCurrentUser(null);
      setInitializing(false);
      return;
    }
    if (meData !== undefined && !meLoading) {
      authResolvedRef.current = true;
      setCurrentUser(meData?.me ?? null);
      setInitializing(false);
    }
  }, [meData, meLoading, meError]);

  // Timeout: redirect to login if auth doesn't complete within 8s
  useEffect(() => {
    if (!getStoredToken()) return;
    const t = setTimeout(() => {
      if (authResolvedRef.current) return;
      clearStoredToken();
      setCurrentUser(null);
      setInitializing(false);
    }, 8000);
    return () => clearTimeout(t);
  }, []);

  const [loginMutation] = useMutation<{
    login: { accessToken: string; user: User };
  }>(LOGIN_MUTATION);

  const login = useCallback(async (phone: string, password: string): Promise<boolean> => {
    try {
      const cleanedPhone = phone.replace(/[^0-9]/g, "");
      const { data } = await loginMutation({
        variables: { input: { phone: cleanedPhone, password } },
      });

      if (data?.login) {
        setStoredToken(data.login.accessToken);
        setCurrentUser(data.login.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [loginMutation]);

  const logout = useCallback(() => {
    clearStoredToken();
    setCurrentUser(null);
    setShowChangelogModal(false);
    setChangelogInitialRelease(null);
    apolloClient.clearStore();
  }, []);

  const openChangelog = useCallback((release?: Release | null) => {
    setChangelogInitialRelease(release ?? null);
    setShowChangelogModal(true);
  }, []);

  const closeChangelog = useCallback(() => {
    setShowChangelogModal(false);
    setChangelogInitialRelease(null);
  }, []);

  const loading = initializing || meLoading;

  const value: AppStoreValue = useMemo(
    () => ({
      currentUser,
      loading,
      showChangelogModal,
      changelogInitialRelease,
      login,
      logout,
      openChangelog,
      closeChangelog,
    }),
    [
      changelogInitialRelease,
      closeChangelog,
      currentUser,
      loading,
      login,
      logout,
      openChangelog,
      showChangelogModal,
    ],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error("useAppStore must be used inside AppProvider");
  }
  return context;
}
