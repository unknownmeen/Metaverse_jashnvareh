#!/bin/bash
# ایجاد Merge Request روی GitLab
# استفاده: GITLAB_TOKEN=your_token ./create-mr.sh
# یا: export GITLAB_TOKEN=... && ./create-mr.sh

set -e
GITLAB_URL="https://gitlab.al-amr.com"
PROJECT="building%2Fjashnvareh"
SOURCE_BRANCH="feature/super-admin-stream-improvements"
TARGET_BRANCH="main"

TITLE="feat: سوپر ادمین، جلوگیری از نظر روی اثر خود، دکمه حذف آپلود و بهبودهای جریان"

DESCRIPTION='## خلاصه
این MR شامل مجموعه‌ای از بهبودها و قابلیت‌های جدید برای پلتفرم جشنواره‌های بصری Building است.

---

### تغییرات اصلی

#### ۱. دسترسی سوپر ادمین و فیلد وضعیت جریان
- نقش **SUPER_ADMIN** با دسترسی به مدیریت کاربران و جریان‌ها
- فیلد **وضعیت جریان** (UNOPENED / OPEN / CLOSED) در فرم ایجاد/ویرایش جریان
- **تیره‌تر شدن کاور** جریان‌های پایان‌یافته برای تمایز بصری

#### ۲. دیباگ نسخه اولیه
- **Slug** برای جشنواره‌ها و تصاویر (آدرس‌های خوانا و SEO-friendly)
- **بهبود مودال اعلانات**: هدایت به جزئیات تصویر با کلیک روی اعلان
- محدودیت حجم فایل آپلود (۱۰ مگابایت) با پیام خطای مناسب

#### ۳. جلوگیری از نظر و امتیاز روی اثر خود
- کاربر **نمی‌تواند** روی اثر خودش نظر یا امتیاز بگذارد
- اعمال در بک‌اند و فرانت‌اند

#### ۴. دکمه حذف (X) روی پیش‌نمایش آپلود
- دکمه حذف روی پیش‌نمایش تصویر کاور و مفهوم در فرم جریان

---

### کامیت‌ها
1. feat: دسترسی سوپر ادمین، فیلد وضعیت جریان، تیره‌تر شدن کاور
2. دیباگ نسخه اولیه
3. feat: جلوگیری از نظر و امتیاز کاربر روی اثر خودش
4. feat: add remove (X) button on upload preview'

if [ -z "$GITLAB_TOKEN" ]; then
  echo "خطا: متغیر GITLAB_TOKEN تنظیم نشده."
  echo "از GitLab: Settings → Access Tokens یک توکن با scope api ایجاد کنید."
  echo "سپس: GITLAB_TOKEN=glpat-xxxx ./create-mr.sh"
  exit 1
fi

DESC_ESC=$(echo "$DESCRIPTION" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Private-Token: $GITLAB_TOKEN" \
  -H "Content-Type: application/json" \
  "$GITLAB_URL/api/v4/projects/$PROJECT/merge_requests" \
  -d "{\"source_branch\":\"$SOURCE_BRANCH\",\"target_branch\":\"$TARGET_BRANCH\",\"title\":\"$TITLE\",\"description\":$DESC_ESC,\"remove_source_branch\":false}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ]; then
  MR_URL=$(echo "$BODY" | grep -o '"web_url":"[^"]*"' | cut -d'"' -f4)
  echo "✅ Merge Request ایجاد شد:"
  echo "$MR_URL"
else
  echo "❌ خطا (HTTP $HTTP_CODE):"
  echo "$BODY"
  exit 1
fi
