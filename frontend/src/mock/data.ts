import type { Comment, ImageItem, NotificationItem, Stream, User } from "@/types/models";

export const seedUsers: User[] = [
  {
    id: "u-admin",
    role: "admin",
    gender: "male",
    realName: "سینا مرادی",
    phone: "09121234567",
    password: "admin123",
    avatarUrl: "https://randomuser.me/api/portraits/men/11.jpg",
  },
  {
    id: "u-female",
    role: "regular",
    gender: "female",
    realName: "هانیه میرزایی",
    displayName: "دختر کوهستان",
    phone: "09123334455",
    password: "user123",
    avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "u-male",
    role: "regular",
    gender: "male",
    realName: "امیرحسین راد",
    phone: "09128887766",
    password: "user123",
    avatarUrl: "https://randomuser.me/api/portraits/men/52.jpg",
  },
  {
    id: "u-judge",
    role: "judge",
    gender: "female",
    realName: "الهام رضوی",
    displayName: "الهام هنر",
    phone: "09124445566",
    password: "judge123",
    avatarUrl: "https://randomuser.me/api/portraits/men/72.jpg",
  },
];

export const seedStreams: Stream[] = [
  {
    id: "s-spring",
    name: "جشنواره رنگ های بهار",
    coverUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80",
    status: "opened",
    conceptMediaType: "video",
    conceptMediaUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    conceptDescription:
      "هدف این جشنواره نمایش برداشت های تصویری از نو شدن طبیعت است. می توانید یک تصویر بسازید که حس طراوت، امید و انرژی اول سال را منتقل کند.",
    formRules:
      "هر کاربر حداکثر ۵ تصویر می تواند ارسال کند. تصاویر باید تولید خودتان باشد و از محتوای کپی شده استفاده نشود. توضیح کوتاه زیر هر تصویر ضروری است.",
  },
  {
    id: "s-city",
    name: "جشنواره نور و شهر",
    coverUrl: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1200&q=80",
    status: "finished",
    conceptMediaType: "image",
    conceptMediaUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=80",
    conceptDescription:
      "در این جریان، نور به عنوان عنصر اصلی روایت شهری مطرح است. کنتراست نورهای گرم و سرد و ریتم زندگی شبانه باید در تصویر دیده شود.",
    formRules:
      "ارسال تصویر جدید بسته شده است. کاربران همچنان می توانند تصاویر و نقدها را ببینند و امتیاز ثبت کنند.",
  },
  {
    id: "s-sea",
    name: "جشنواره زندگی ساحلی",
    coverUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80",
    status: "not_opened",
    conceptMediaType: "image",
    conceptMediaUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
    conceptDescription:
      "این رویداد روی حس آرامش، تابش آفتاب و ارتباط انسان با طبیعت تمرکز دارد و به زودی شروع می شود.",
    formRules:
      "جریان هنوز باز نشده است. پس از شروع، امکان ارسال تصویر فعال خواهد شد.",
  },
];

export const seedImages: ImageItem[] = [
  {
    id: "img-2",
    streamId: "s-spring",
    ownerId: "u-male",
    title: "کوچه شکوفه ها",
    url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-02-22T11:00:00.000Z",
    tags: ["گل", "شهر"],
    isFeatured: false,
  },
  {
    id: "img-4",
    streamId: "s-city",
    ownerId: "u-admin",
    title: "پنجره های روشن",
    url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-01-09T20:40:00.000Z",
    tags: ["نور", "شهر"],
    isFeatured: true,
  },
  {
    id: "img-6",
    streamId: "s-city",
    ownerId: "u-male",
    title: "پل مهتاب",
    url: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-01-05T18:10:00.000Z",
    tags: ["پل", "نور"],
    isFeatured: false,
  },
];

export const seedComments: Comment[] = [
  {
    id: "c-1",
    imageId: "img-4",
    userId: "u-admin",
    rating: 5,
    text:
      "ترکیب رنگی خیلی دقیق است و حس شروع دوباره را عالی منتقل می کند. برای منتخب شدن این جریان، کادر بندی این اثر کاملا مناسب بود.",
    createdAt: "2026-02-25T13:40:00.000Z",
    isCritique: true,
  },
  {
    id: "c-2",
    imageId: "img-4",
    userId: "u-male",
    rating: 4,
    text: "نور و عمق تصویر بسیار خوب است. فقط اگر جزئیات آسمان کمی بیشتر بود، کامل تر می شد.",
    createdAt: "2026-02-25T15:20:00.000Z",
  },
  {
    id: "c-3",
    imageId: "img-4",
    userId: "u-female",
    rating: 5,
    text: "فضای شهری خیلی زنده دیده می شود و ترکیب رنگ گرم و سرد متعادل است.",
    createdAt: "2026-01-11T09:10:00.000Z",
  },
];

export const seedNotifications: NotificationItem[] = [
  {
    id: "n-1",
    icon: "comment",
    text: "برای تصویر شما یک نظر و امتیاز جدید ثبت شد.",
    createdAt: "2026-03-02T10:15:00.000Z",
    avatarUrl: "https://randomuser.me/api/portraits/men/52.jpg",
    read: false,
    targetUserId: "u-admin",
    imageId: "img-4",
  },
  {
    id: "n-2",
    icon: "system",
    text: "تصویر شما «پنجره های روشن» به عنوان منتخب ادمین انتخاب شد.",
    createdAt: "2026-03-01T17:00:00.000Z",
    read: false,
    targetUserId: "u-admin",
    imageId: "img-4",
  },
  {
    id: "n-3",
    icon: "system",
    text: "جریان زندگی ساحلی به زودی آغاز می شود.",
    createdAt: "2026-02-28T09:30:00.000Z",
    read: true,
    streamId: "s-sea",
  },
];
