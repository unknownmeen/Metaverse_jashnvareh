import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { toPersianDigits } from "@/lib/format";
import { seedComments, seedImages, seedNotifications, seedStreams, seedUsers } from "@/mock/data";
import type { Comment, ImageItem, NotificationItem, Stream, StreamInput, User } from "@/types/models";

interface ProfilePayload {
  realName: string;
  displayName?: string;
  password?: string;
  avatarUrl?: string;
}

interface AppStoreValue {
  users: User[];
  streams: Stream[];
  images: ImageItem[];
  comments: Comment[];
  notifications: NotificationItem[];
  currentUser: User | null;
  login: (phone: string, password: string) => boolean;
  logout: () => void;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  addComment: (imageId: string, rating: number, text: string) => void;
  createStream: (payload: StreamInput) => string;
  updateStream: (streamId: string, payload: StreamInput) => void;
  deleteStream: (streamId: string) => void;
  createImageForStream: (streamId: string, opts?: { url?: string; title?: string }) => string | null;
  toggleImageFeatured: (imageId: string) => void;
  saveProfile: (payload: ProfilePayload) => void;
}

const randomImagePool = [
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1508615039623-a25647d1a9a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80",
];

const AppStoreContext = createContext<AppStoreValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [streams, setStreams] = useState<Stream[]>(seedStreams);
  const [images, setImages] = useState<ImageItem[]>(seedImages);
  const [comments, setComments] = useState<Comment[]>(seedComments);
  const [notifications, setNotifications] = useState<NotificationItem[]>(seedNotifications);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const currentUser = useMemo(() => users.find((user) => user.id === currentUserId) ?? null, [currentUserId, users]);

  const login = (phone: string, password: string): boolean => {
    const cleanedPhone = phone.replace(/[^0-9]/g, "");
    const user = users.find((item) => item.phone === cleanedPhone && item.password === password);

    if (!user) {
      return false;
    }

    setCurrentUserId(user.id);
    return true;
  };

  const logout = () => {
    setCurrentUserId(null);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  };

  const addComment = (imageId: string, rating: number, text: string) => {
    if (!currentUser || currentUser.role === "judge") {
      return;
    }

    const image = images.find((i) => i.id === imageId);
    if (!image) return;

    const newComment: Comment = {
      id: `c-${crypto.randomUUID().slice(0, 8)}`,
      imageId,
      userId: currentUser.id,
      rating,
      text,
      createdAt: new Date().toISOString(),
      isCritique: currentUser.role === "admin",
    };

    setComments((prev) => [newComment, ...prev]);

    if (image.ownerId !== currentUser.id) {
      const newNotif: NotificationItem = {
        id: `n-${crypto.randomUUID().slice(0, 8)}`,
        icon: "comment",
        text: "برای تصویر شما یک نظر و امتیاز جدید ثبت شد.",
        createdAt: new Date().toISOString(),
        avatarUrl: currentUser.avatarUrl,
        read: false,
        targetUserId: image.ownerId,
        imageId,
      };
      setNotifications((prev) => {
        const recentSame = prev.some(
          (n) =>
            n.imageId === imageId &&
            n.icon === "comment" &&
            n.targetUserId === image.ownerId &&
            Date.now() - new Date(n.createdAt).getTime() < 5000,
        );
        return recentSame ? prev : [newNotif, ...prev];
      });
    }
  };

  const createStream = (payload: StreamInput): string => {
    const streamId = `s-${crypto.randomUUID().slice(0, 8)}`;

    setStreams((prev) => [{ ...payload, id: streamId }, ...prev]);

    setNotifications((prev) => [
      {
        id: `n-${crypto.randomUUID().slice(0, 8)}`,
        icon: "system",
        text: `جریان جدید «${payload.name}» ایجاد شد.`,
        createdAt: new Date().toISOString(),
        read: false,
        streamId,
      },
      ...prev,
    ]);
    return streamId;
  };

  const updateStream = (streamId: string, payload: StreamInput) => {
    setStreams((prev) => prev.map((stream) => (stream.id === streamId ? { ...stream, ...payload } : stream)));
  };

  const deleteStream = (streamId: string) => {
    const deletedIds = images.filter((image) => image.streamId === streamId).map((image) => image.id);
    setStreams((prev) => prev.filter((stream) => stream.id !== streamId));
    setImages((prev) => prev.filter((image) => image.streamId !== streamId));
    setComments((prev) => prev.filter((comment) => !deletedIds.includes(comment.imageId)));
  };

  const createImageForStream = (
    streamId: string,
    opts?: { url?: string; title?: string },
  ): string | null => {
    if (!currentUser || currentUser.role === "judge") {
      return null;
    }

    const stream = streams.find((item) => item.id === streamId);
    if (!stream || stream.status !== "opened") {
      return null;
    }

    const nextNumber = images.filter((image) => image.streamId === streamId).length + 1;
    const imageId = `img-${crypto.randomUUID().slice(0, 8)}`;

    const newImage: ImageItem = {
      id: imageId,
      streamId,
      ownerId: currentUser.id,
      title: opts?.title?.trim() || `ارسال ${toPersianDigits(nextNumber)}`,
      createdAt: new Date().toISOString(),
      tags: ["جدید"],
      isFeatured: false,
      url: opts?.url || randomImagePool[Math.floor(Math.random() * randomImagePool.length)],
    };

    setImages((prev) => [newImage, ...prev]);

    const adminUser = users.find((u) => u.role === "admin");
    if (stream && adminUser && adminUser.id !== currentUser.id) {
      setNotifications((prev) => [
        {
          id: `n-${crypto.randomUUID().slice(0, 8)}`,
          icon: "system",
          text: `تصویر جدیدی در جریان «${stream.name}» آپلود شد.`,
          createdAt: new Date().toISOString(),
          read: false,
          targetUserId: adminUser.id,
          imageId,
          streamId,
        },
        ...prev,
      ]);
    }
    return imageId;
  };

  const toggleImageFeatured = (imageId: string) => {
    if (!currentUser || currentUser.role !== "admin") return;
    const image = images.find((i) => i.id === imageId);
    if (!image) return;

    const nextFeatured = !image.isFeatured;
    setImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, isFeatured: nextFeatured } : img)),
    );

    if (nextFeatured && image.ownerId !== currentUser.id) {
      setNotifications((prev) => [
        {
          id: `n-${crypto.randomUUID().slice(0, 8)}`,
          icon: "system",
          text: `تصویر شما «${image.title}» به عنوان منتخب ادمین انتخاب شد.`,
          createdAt: new Date().toISOString(),
          read: false,
          targetUserId: image.ownerId,
          imageId,
        },
        ...prev,
      ]);
    }
  };

  const saveProfile = (payload: ProfilePayload) => {
    if (!currentUser) {
      return;
    }

    setUsers((prev) =>
      prev.map((user) => {
        if (user.id !== currentUser.id) {
          return user;
        }

        return {
          ...user,
          realName: payload.realName.trim(),
          displayName: user.gender === "female" ? payload.displayName?.trim() || undefined : undefined,
          password: payload.password?.trim() ? payload.password.trim() : user.password,
          avatarUrl: payload.avatarUrl !== undefined ? payload.avatarUrl : user.avatarUrl,
        };
      }),
    );
  };

  const value: AppStoreValue = {
    users,
    streams,
    images,
    comments,
    notifications,
    currentUser,
    login,
    logout,
    markAllNotificationsRead,
    markNotificationRead,
    addComment,
    createStream,
    updateStream,
    deleteStream,
    createImageForStream,
    toggleImageFeatured,
    saveProfile,
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error("useAppStore must be used inside AppProvider");
  }

  return context;
}
