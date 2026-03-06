import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, ChevronLeft, HelpCircle, Home, Layers, ShieldCheck, UserCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client/react";

import { useAppStore } from "@/app/store";
import type { NotificationItem } from "@/types/models";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDateFa, formatTimeFa, toPersianDigits } from "@/lib/format";
import { t } from "@/lib/i18n";
import {
  GET_MY_NOTIFICATIONS_QUERY,
  MARK_ALL_NOTIFICATIONS_READ_MUTATION,
  MARK_NOTIFICATION_READ_MUTATION,
} from "@/graphql/operations";
import { playNotificationSound } from "@/services/notification-sound";

const NOTIFICATIONS_POLL_MS = 4000;

interface BreadcrumbItem {
  path: string;
  label: string;
}

function buildBreadcrumb(pathname: string): BreadcrumbItem[] {
  if (pathname === "/home") return [{ path: "/home", label: t("nav.home") }];
  if (pathname === "/profile") return [{ path: "/profile", label: t("nav.profile") }];
  if (pathname === "/help") return [{ path: "/help", label: t("nav.help") }];
  if (pathname === "/streams") return [{ path: "/streams", label: t("nav.streams") }];
  if (pathname.startsWith("/streams/") && pathname !== "/streams") {
    return [{ path: "/streams", label: t("nav.streams") }, { path: pathname, label: t("nav.breadcrumb_stream") }];
  }
  if (pathname === "/admin") return [{ path: "/admin", label: t("nav.admin_view") }];
  if (pathname === "/admin/streams/new") {
    return [{ path: "/admin", label: t("nav.admin_view") }, { path: "/admin/streams/new", label: t("admin.create_stream") }];
  }
  if (pathname.match(/^\/admin\/streams\/[^/]+\/edit$/)) {
    return [{ path: "/admin", label: t("nav.admin_view") }, { path: pathname, label: t("nav.breadcrumb_edit_stream") }];
  }
  if (pathname === "/super-admin/users") return [{ path: "/super-admin/users", label: t("nav.user_management") }];
  if (pathname.startsWith("/images/")) return [{ path: pathname, label: t("nav.breadcrumb_image") }];
  return [];
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

function PillNavbar({ userAvatar, userName }: { userAvatar?: string; userName?: string }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const ref = useRef<HTMLDivElement>(null);
  const { currentUser } = useAppStore();

  const navItems: NavItem[] = [
    { path: "/home", label: t("nav.home"), icon: Home },
    ...(currentUser?.role !== "ADMIN" && currentUser?.role !== "SUPER_ADMIN"
      ? [{ path: "/streams", label: t("nav.streams"), icon: Layers }]
      : []),
    ...(currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN"
      ? [{ path: "/admin", label: t("nav.admin_view"), icon: Layers }]
      : []),
    ...(currentUser?.role === "SUPER_ADMIN"
      ? [{ path: "/super-admin/users", label: t("nav.user_management"), icon: ShieldCheck }]
      : []),
    { path: "/profile", label: t("nav.profile"), icon: UserCircle },
  ];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const currentItem = navItems.find((item) => location.pathname.startsWith(item.path));
  const CurrentIcon = currentItem?.icon ?? Home;

  return (
    <div ref={ref} className="relative z-50 flex items-center gap-2">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full transition-all shadow-sm overflow-hidden",
          open ? "bg-slate-200 text-slate-600" : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700",
        )}
      >
        {location.pathname === "/profile" && userAvatar ? (
          <Avatar className="h-full w-full">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback>
              <UserCircle className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        ) : (
          <CurrentIcon className="h-5 w-5" />
        )}
      </button>

      {open && (
        <div className="absolute top-14 right-0 flex flex-col items-center gap-1 rounded-[1.75rem] border border-slate-200 bg-slate-100 p-2 shadow-lg animate-scale-in">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={cn(
                  "group relative flex h-11 w-11 items-center justify-center rounded-full transition-all overflow-hidden",
                  isActive ? "bg-white text-primary-600 shadow-sm" : "text-slate-400 hover:bg-white hover:text-slate-600",
                )}
                title={item.label}
              >
                {item.path === "/profile" && userAvatar ? (
                  <Avatar className="h-full w-full">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback>
                      <UserCircle className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <item.icon className="h-5 w-5" />
                )}
                <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useQuery<{ myNotifications: NotificationItem[] }>(GET_MY_NOTIFICATIONS_QUERY, {
    skip: !open,
    pollInterval: NOTIFICATIONS_POLL_MS,
  });

  const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ_MUTATION, {
    refetchQueries: [{ query: GET_MY_NOTIFICATIONS_QUERY }],
  });

  const [markOneRead] = useMutation(MARK_NOTIFICATION_READ_MUTATION, {
    refetchQueries: [{ query: GET_MY_NOTIFICATIONS_QUERY }],
  });

  const myNotifications = data?.myNotifications ?? [];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  if (!open) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "COMMENT":
        return "💬";
      case "RATING":
        return "⭐";
      default:
        return "🔔";
    }
  };

  const handleNotificationClick = (n: NotificationItem) => {
    markOneRead({ variables: { id: n.id } });
    onClose();
    // Navigate based on notification type - for now just close
  };

  const hasUnread = myNotifications.some((n) => !n.isRead);

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl animate-scale-in z-50"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-l from-primary-50 to-white px-4 py-3">
        <h3 className="text-right font-bold text-slate-800">{t("notifications.title")}</h3>
        <button
          type="button"
          onClick={() => markAllRead()}
          className={cn(
            "flex flex-shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
            hasUnread ? "cursor-pointer text-primary-500 hover:bg-primary-50 hover:text-primary-600" : "cursor-default text-slate-400",
          )}
        >
          <CheckCheck className="h-4 w-4" />
          <span>{t("notifications.read_all")}</span>
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {myNotifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-400">{t("notifications.empty")}</div>
        ) : (
          myNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              role="button"
              className={cn(
                "border-b border-slate-50 px-4 py-3 transition-colors cursor-pointer hover:bg-slate-50",
                !notification.isRead && "bg-primary-50/50",
              )}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-xl">{getIcon(notification.type)}</span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-right text-sm leading-relaxed", !notification.isRead ? "font-semibold text-slate-800" : "text-slate-600")}>
                    {notification.text}
                  </p>
                  <p className="mt-1 text-right text-xs text-slate-400">
                    {formatDateFa(notification.createdAt)} | {formatTimeFa(notification.createdAt)}
                  </p>
                </div>
                {!notification.isRead && <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary-500" />}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function AppHeader() {
  const { currentUser } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const previousUnreadRef = useRef<number | null>(null);

  const breadcrumb = buildBreadcrumb(location.pathname);

  const { data, refetch } = useQuery<{ myNotifications: NotificationItem[] }>(GET_MY_NOTIFICATIONS_QUERY, {
    pollInterval: NOTIFICATIONS_POLL_MS,
    fetchPolicy: "network-only",
  });

  const myNotifications = data?.myNotifications ?? [];
  const unreadCount = myNotifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (previousUnreadRef.current != null && unreadCount > previousUnreadRef.current && !document.hidden) {
      playNotificationSound();
    }
    previousUnreadRef.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (!document.hidden) refetch();
    };
    const onFocus = () => refetch();
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
    };
  }, [refetch]);

  if (!currentUser) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-lg">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <PillNavbar userAvatar={currentUser.avatarUrl ?? undefined} userName={currentUser.realName} />

          {breadcrumb.length > 0 && (
            <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
              {breadcrumb.map((item, index) => (
                <div key={item.path + index} className="flex flex-shrink-0 items-center gap-1">
                  {index > 0 && <ChevronLeft className="h-4 w-4 text-slate-300" />}
                  <button
                    type="button"
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "rounded-lg px-2 py-1 text-right text-sm whitespace-nowrap transition-colors",
                      index === breadcrumb.length - 1
                        ? "bg-primary-50 font-bold text-primary-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-primary-600",
                    )}
                  >
                    {item.label}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Link to="/help" className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-50" aria-label={t("nav.help")}>
            <HelpCircle className="h-5 w-5" />
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="relative rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-50"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -left-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {toPersianDigits(unreadCount)}
                </span>
              )}
            </button>
            <NotificationPanel open={showNotif} onClose={() => setShowNotif(false)} />
          </div>
        </div>
      </div>
    </header>
  );
}
