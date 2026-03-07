import {
  PrismaClient,
  Role,
  Gender,
  FestivalStatus,
  ConceptMediaType,
  NotificationType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = '123456';

async function main() {
  console.log('🌱 Seeding database...');

  const defaultPasswordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // ── Users ────────────────────────────────────────────────

  const user1 = await prisma.user.upsert({
    where: { phone: '09059737386' },
    update: {},
    create: {
      phone: '09059737386',
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      gender: Gender.MALE,
      realName: 'علی ضیاءفر',
      displayName: 'علی ادمین',
      avatarUrl: 'https://i.pravatar.cc/150?u=admin1',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { phone: '09912775541' },
    update: {},
    create: {
      phone: '09912775541',
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      gender: Gender.MALE,
      realName: 'پارسا امیری',
      displayName: 'پارسا',
      avatarUrl: 'https://i.pravatar.cc/150?u=admin2',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { phone: '09128119142' },
    update: {},
    create: {
      phone: '09128119142',
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      gender: Gender.MALE,
      realName: 'علی عسگری',
      displayName: 'علی عسگری',
      avatarUrl: 'https://i.pravatar.cc/150?u=admin3',
    },
  });

  const user4 = await prisma.user.upsert({
    where: { phone: '09129324227' },
    update: { role: Role.SUPER_ADMIN },
    create: {
      phone: '09129324227',
      passwordHash: defaultPasswordHash,
      role: Role.SUPER_ADMIN,
      gender: Gender.MALE,
      realName: 'مصطفی محسنی کبیر',
      displayName: 'مصطفی',
      avatarUrl: 'https://i.pravatar.cc/150?u=superadmin',
    },
  });

  // کاربران عادی برای تست کامنت و امتیاز
  const user5 = await prisma.user.upsert({
    where: { phone: '09121234567' },
    update: {},
    create: {
      phone: '09121234567',
      passwordHash: defaultPasswordHash,
      role: Role.USER,
      gender: Gender.MALE,
      realName: 'سینا مرادی',
      displayName: 'سینا تست',
      avatarUrl: 'https://i.pravatar.cc/150?u=user1',
    },
  });

  const user6 = await prisma.user.upsert({
    where: { phone: '09123334455' },
    update: {},
    create: {
      phone: '09123334455',
      passwordHash: defaultPasswordHash,
      role: Role.USER,
      gender: Gender.FEMALE,
      realName: 'هانیه میرزایی',
      displayName: 'دختر کوهستان',
      avatarUrl: 'https://i.pravatar.cc/150?u=user2',
    },
  });

  const user7 = await prisma.user.upsert({
    where: { phone: '09128887766' },
    update: {},
    create: {
      phone: '09128887766',
      passwordHash: defaultPasswordHash,
      role: Role.USER,
      gender: Gender.MALE,
      realName: 'امیرحسین راد',
      displayName: 'امیرحسین',
      avatarUrl: 'https://i.pravatar.cc/150?u=user3',
    },
  });

  const user8 = await prisma.user.upsert({
    where: { phone: '09124445566' },
    update: {},
    create: {
      phone: '09124445566',
      passwordHash: defaultPasswordHash,
      role: Role.JUDGE,
      gender: Gender.FEMALE,
      realName: 'الهام رضوی',
      displayName: 'الهام هنر',
      avatarUrl: 'https://i.pravatar.cc/150?u=judge1',
    },
  });

  console.log('✅ Users seeded');

  // ── Festivals (جریان‌ها / استریم‌ها) ────────────────────────

  const festival1 = await prisma.festival.upsert({
    where: { id: 'seed-fest-spring' },
    update: {},
    create: {
      id: 'seed-fest-spring',
      name: 'جشنواره رنگ‌های بهار',
      coverImageUrl: 'https://picsum.photos/seed/spring/1200/600',
      conceptMediaType: ConceptMediaType.VIDEO,
      conceptMediaUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      conceptText: 'هدف این جشنواره نمایش برداشت‌های تصویری از نو شدن طبیعت است. می‌توانید یک تصویر بسازید که حس طراوت، امید و انرژی اول سال را منتقل کند.',
      rulesText: 'هر کاربر حداکثر ۵ تصویر می‌تواند ارسال کند. تصاویر باید تولید خودتان باشد و از محتوای کپی شده استفاده نشود. توضیح کوتاه زیر هر تصویر ضروری است.',
      status: FestivalStatus.OPEN,
    },
  });

  const festival2 = await prisma.festival.upsert({
    where: { id: 'seed-fest-city' },
    update: {},
    create: {
      id: 'seed-fest-city',
      name: 'جشنواره نور و شهر',
      coverImageUrl: 'https://picsum.photos/seed/city/1200/600',
      conceptMediaType: ConceptMediaType.IMAGE,
      conceptMediaUrl: 'https://picsum.photos/seed/city2/1200/800',
      conceptText: 'در این جریان، نور به عنوان عنصر اصلی روایت شهری مطرح است. کنتراست نورهای گرم و سرد و ریتم زندگی شبانه باید در تصویر دیده شود.',
      rulesText: 'ارسال تصویر جدید بسته شده است. کاربران همچنان می‌توانند تصاویر و نقدها را ببینند و امتیاز ثبت کنند.',
      status: FestivalStatus.CLOSED,
    },
  });

  const festival3 = await prisma.festival.upsert({
    where: { id: 'seed-fest-sea' },
    update: {},
    create: {
      id: 'seed-fest-sea',
      name: 'جشنواره زندگی ساحلی',
      coverImageUrl: 'https://picsum.photos/seed/sea/1200/600',
      conceptMediaType: ConceptMediaType.IMAGE,
      conceptMediaUrl: 'https://picsum.photos/seed/sea2/1200/800',
      conceptText: 'این رویداد روی حس آرامش، تابش آفتاب و ارتباط انسان با طبیعت تمرکز دارد و به زودی شروع می‌شود.',
      rulesText: 'جریان هنوز باز نشده است. پس از شروع، امکان ارسال تصویر فعال خواهد شد.',
      status: FestivalStatus.UNOPENED,
    },
  });

  console.log('✅ Festivals seeded');

  // ── Images ────────────────────────────────────────────────

  const image1 = await prisma.image.upsert({
    where: { id: 'seed-img-1' },
    update: {},
    create: {
      id: 'seed-img-1',
      url: 'https://picsum.photos/seed/img1/800/600',
      title: 'کوچه شکوفه‌ها',
      isTopImage: false,
      tags: ['گل', 'شهر', 'بهار'],
      festivalId: festival1.id,
      userId: user7.id,
    },
  });

  const image2 = await prisma.image.upsert({
    where: { id: 'seed-img-2' },
    update: {},
    create: {
      id: 'seed-img-2',
      url: 'https://picsum.photos/seed/img2/800/600',
      title: 'پنجره‌های روشن',
      isTopImage: true,
      tags: ['نور', 'شهر', 'شب'],
      festivalId: festival2.id,
      userId: user1.id,
    },
  });

  const image3 = await prisma.image.upsert({
    where: { id: 'seed-img-3' },
    update: {},
    create: {
      id: 'seed-img-3',
      url: 'https://picsum.photos/seed/img3/800/600',
      title: 'پل مهتاب',
      isTopImage: false,
      tags: ['پل', 'نور', 'شب'],
      festivalId: festival2.id,
      userId: user7.id,
    },
  });

  const image4 = await prisma.image.upsert({
    where: { id: 'seed-img-4' },
    update: {},
    create: {
      id: 'seed-img-4',
      url: 'https://picsum.photos/seed/img4/800/600',
      title: 'طلوع در باغ',
      isTopImage: false,
      tags: ['طبیعت', 'صبح', 'گل'],
      festivalId: festival1.id,
      userId: user6.id,
    },
  });

  const image5 = await prisma.image.upsert({
    where: { id: 'seed-img-5' },
    update: {},
    create: {
      id: 'seed-img-5',
      url: 'https://picsum.photos/seed/img5/800/600',
      title: 'خیابان پرنور',
      isTopImage: false,
      tags: ['شهر', 'نور', 'خیابان'],
      festivalId: festival2.id,
      userId: user5.id,
    },
  });

  console.log('✅ Images seeded');

  // ── Comments ────────────────────────────────────────────────

  await prisma.comment.upsert({
    where: { id: 'seed-comment-1' },
    update: {},
    create: {
      id: 'seed-comment-1',
      text: 'ترکیب رنگی خیلی دقیق است و حس شروع دوباره را عالی منتقل می‌کند. برای منتخب شدن این جریان، کادر بندی این اثر کاملا مناسب بود.',
      isAdminReview: true,
      imageId: image2.id,
      userId: user1.id,
    },
  });

  await prisma.comment.upsert({
    where: { id: 'seed-comment-2' },
    update: {},
    create: {
      id: 'seed-comment-2',
      text: 'نور و عمق تصویر بسیار خوب است. فقط اگر جزئیات آسمان کمی بیشتر بود، کامل‌تر می‌شد.',
      isAdminReview: false,
      imageId: image2.id,
      userId: user7.id,
    },
  });

  await prisma.comment.upsert({
    where: { id: 'seed-comment-3' },
    update: {},
    create: {
      id: 'seed-comment-3',
      text: 'فضای شهری خیلی زنده دیده می‌شود و ترکیب رنگ گرم و سرد متعادل است.',
      isAdminReview: false,
      imageId: image2.id,
      userId: user6.id,
    },
  });

  await prisma.comment.upsert({
    where: { id: 'seed-comment-4' },
    update: {},
    create: {
      id: 'seed-comment-4',
      text: 'کار زیبایی است، امیدوارم در جشنواره بعدی هم شرکت کنید.',
      isAdminReview: false,
      imageId: image1.id,
      userId: user5.id,
    },
  });

  await prisma.comment.upsert({
    where: { id: 'seed-comment-5' },
    update: {},
    create: {
      id: 'seed-comment-5',
      text: 'نورپردازی پل خیلی جذاب است. موفق باشید!',
      isAdminReview: false,
      imageId: image3.id,
      userId: user8.id,
    },
  });

  console.log('✅ Comments seeded');

  // ── Ratings ────────────────────────────────────────────────

  await prisma.rating.upsert({
    where: { imageId_userId: { imageId: image2.id, userId: user7.id } },
    update: { score: 4 },
    create: { imageId: image2.id, userId: user7.id, score: 4 },
  });

  await prisma.rating.upsert({
    where: { imageId_userId: { imageId: image2.id, userId: user6.id } },
    update: { score: 5 },
    create: { imageId: image2.id, userId: user6.id, score: 5 },
  });

  await prisma.rating.upsert({
    where: { imageId_userId: { imageId: image2.id, userId: user8.id } },
    update: { score: 5 },
    create: { imageId: image2.id, userId: user8.id, score: 5 },
  });

  await prisma.rating.upsert({
    where: { imageId_userId: { imageId: image1.id, userId: user5.id } },
    update: { score: 4 },
    create: { imageId: image1.id, userId: user5.id, score: 4 },
  });

  await prisma.rating.upsert({
    where: { imageId_userId: { imageId: image1.id, userId: user6.id } },
    update: { score: 5 },
    create: { imageId: image1.id, userId: user6.id, score: 5 },
  });

  await prisma.rating.upsert({
    where: { imageId_userId: { imageId: image3.id, userId: user5.id } },
    update: { score: 3 },
    create: { imageId: image3.id, userId: user5.id, score: 3 },
  });

  await prisma.rating.upsert({
    where: { imageId_userId: { imageId: image3.id, userId: user8.id } },
    update: { score: 4 },
    create: { imageId: image3.id, userId: user8.id, score: 4 },
  });

  console.log('✅ Ratings seeded');

  // ── Notifications ────────────────────────────────────────────────

  await prisma.notification.upsert({
    where: { id: 'seed-notif-1' },
    update: {},
    create: {
      id: 'seed-notif-1',
      type: NotificationType.COMMENT,
      text: 'برای تصویر شما یک نظر و امتیاز جدید ثبت شد.',
      isRead: false,
      userId: user1.id,
      senderId: user7.id,
    },
  });

  await prisma.notification.upsert({
    where: { id: 'seed-notif-2' },
    update: {},
    create: {
      id: 'seed-notif-2',
      type: NotificationType.TOP_IMAGE,
      text: 'تصویر شما «پنجره‌های روشن» به عنوان منتخب ادمین انتخاب شد.',
      isRead: false,
      userId: user1.id,
      senderId: user2.id,
    },
  });

  await prisma.notification.upsert({
    where: { id: 'seed-notif-3' },
    update: {},
    create: {
      id: 'seed-notif-3',
      type: NotificationType.SYSTEM,
      text: 'جریان زندگی ساحلی به زودی آغاز می‌شود.',
      isRead: true,
      userId: user5.id,
    },
  });

  await prisma.notification.upsert({
    where: { id: 'seed-notif-4' },
    update: {},
    create: {
      id: 'seed-notif-4',
      type: NotificationType.RATING,
      text: 'کاربری به تصویر شما امتیاز داد.',
      isRead: false,
      userId: user7.id,
      senderId: user5.id,
    },
  });

  await prisma.notification.upsert({
    where: { id: 'seed-notif-5' },
    update: {},
    create: {
      id: 'seed-notif-5',
      type: NotificationType.COMMENT,
      text: 'یک نظر جدید روی تصویر شما ثبت شد.',
      isRead: true,
      userId: user6.id,
      senderId: user5.id,
    },
  });

  console.log('✅ Notifications seeded');

  console.log(`
✅ Seed completed successfully!

📋 خلاصه داده‌های تست:
  • کاربران: ۸ نفر (۴ ادمین، ۳ کاربر عادی، ۱ داور)
  • جریان‌ها: ۳ جشنواره (باز، بسته، باز نشده)
  • تصاویر: ۵ تصویر با تگ و عنوان
  • کامنت‌ها: ۵ کامنت (۱ نقد ادمین، ۴ نظر کاربر)
  • امتیازها: ۷ امتیاز روی تصاویر
  • اعلان‌ها: ۵ اعلان

🔑 رمز همه کاربران: ${DEFAULT_PASSWORD}
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });