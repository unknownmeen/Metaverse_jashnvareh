import { PrismaClient, Role, Gender } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with users...');

  // یک رمز عبور پیش‌فرض برای هر سه نفر می‌سازیم (مثلا 123456)
  const defaultPasswordHash = await bcrypt.hash('123456', 10);

  // ── Users ────────────────────────────────────────────────

  // ۱. علی ضیاءفر (ادمین)
  await prisma.user.upsert({
    where: { phone: '09059737386' },
    update: {},
    create: {
      phone: '09059737386',
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      gender: Gender.MALE,
      realName: 'علی ضیاءفر',
    },
  });

  // ۲. پارسا امیری (ادمین)
  await prisma.user.upsert({
    where: { phone: '09912775541' },
    update: {},
    create: {
      phone: '09912775541',
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      gender: Gender.MALE,
      realName: 'پارسا امیری',
    },
  });

  // ۳. علی عسگری (ادمین)
  await prisma.user.upsert({
    where: { phone: '09128119142' },
    update: {},
    create: {
      phone: '09128119142',
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      gender: Gender.MALE,
      realName: 'علی عسگری',
    },
  });

  // ۴. مصطفی محسنی کبیر (سوپر ادمین)
  await prisma.user.upsert({
    where: { phone: '09129324227' },
    update: { role: Role.SUPER_ADMIN },
    create: {
      phone: '09129324227',
      passwordHash: defaultPasswordHash,
      role: Role.SUPER_ADMIN,
      gender: Gender.MALE,
      realName: 'مصطفی محسنی کبیر',
    },
  });

  console.log('✅ Seed completed successfully. Users are ready.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });