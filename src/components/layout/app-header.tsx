import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, HelpCircle, Home, Layers, Settings, UserCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAppStore } from "@/app/store";
import type { NotificationItem } from "@/types/models";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDateFa, formatTimeFa, toPersianDigits } from "@/lib/format";

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
    { path: "/home", label: "خانه", icon: Home },
    { path: "/streams", label: "جریان ها", icon: Layers },
    { path: "/profile", label: "پروفایل", icon: UserCircle },
    ...(currentUser?.role === "admin" ? [{ path: "/admin", label: "نمای ادمین", icon: Settings }] : []),
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
      <Link
        to="/home"
        className="flex-shrink-0 rounded-xl bg-primary-100 px-4 py-2 text-base font-bold text-primary-700 transition-colors hover:bg-primary-200 hover:text-primary-800"
      >
        جشنواره
      </Link>

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
  const navigate = useNavigate();
  const { currentUser, notifications, markAllNotificationsRead, markNotificationRead } = useAppStore();
  const ref = useRef<HTMLDivElement>(null);

  const myNotifications = currentUser
    ? notifications.filter((n) => !n.targetUserId || n.targetUserId === currentUser.id)
    : [];

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
      case "comment":
        return "💬";
      case "rating":
        return "⭐";
      default:
        return "🔔";
    }
  };

  const handleNotificationClick = (n: NotificationItem) => {
    if (n.imageId) {
      markNotificationRead(n.id);
      navigate(`/images/${n.imageId}`);
      onClose();
    } else if (n.streamId) {
      markNotificationRead(n.id);
      navigate(`/streams/${n.streamId}`);
      onClose();
    }
  };

  const hasUnread = myNotifications.some((n) => !n.read);

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl animate-scale-in z-50"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-l from-primary-50 to-white px-4 py-3">
        <h3 className="text-right font-bold text-slate-800">اعلان ها</h3>
        <button
          type="button"
          onClick={markAllNotificationsRead}
          className={cn(
            "flex flex-shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
            hasUnread ? "cursor-pointer text-primary-500 hover:bg-primary-50 hover:text-primary-600" : "cursor-default text-slate-400",
          )}
        >
          <CheckCheck className="h-4 w-4" />
          <span>خوانده شد</span>
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {myNotifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-400">اعلانی وجود ندارد</div>
        ) : (
          myNotifications.map((notification) => {
            const hasLink = Boolean(notification.imageId || notification.streamId);
            return (
              <div
                key={notification.id}
                onClick={() => hasLink && handleNotificationClick(notification)}
                role={hasLink ? "button" : undefined}
                className={cn(
                  "border-b border-slate-50 px-4 py-3 transition-colors",
                  hasLink && "cursor-pointer hover:bg-slate-50",
                  !notification.read && "bg-primary-50/50",
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-xl">{getIcon(notification.icon)}</span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-right text-sm leading-relaxed", !notification.read ? "font-semibold text-slate-800" : "text-slate-600")}>
                      {notification.text}
                    </p>
                    <p className="mt-1 text-right text-xs text-slate-400">
                      {formatDateFa(notification.createdAt)} | {formatTimeFa(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary-500" />}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function AppHeader() {
  const { currentUser, notifications } = useAppStore();
  const [showNotif, setShowNotif] = useState(false);

  if (!currentUser) {
    return null;
  }

  const myNotifications = notifications.filter(
    (n) => !n.targetUserId || n.targetUserId === currentUser.id,
  );
  const unreadCount = myNotifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-lg">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <PillNavbar userAvatar={currentUser.avatarUrl} userName={currentUser.realName} />
        </div>

        <div className="flex items-center gap-1">
          <Link to="/help" className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-50" aria-label="راهنما">
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
