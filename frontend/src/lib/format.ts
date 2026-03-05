const digitMap: Record<string, string> = {
  "0": "۰",
  "1": "۱",
  "2": "۲",
  "3": "۳",
  "4": "۴",
  "5": "۵",
  "6": "۶",
  "7": "۷",
  "8": "۸",
  "9": "۹",
};

const persianToEnglish: Record<string, string> = {
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
};

export function toPersianDigits(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[0-9]/g, (digit) => digitMap[digit] ?? digit);
}

/** Converts Persian/Arabic digits to English. Use for normalizing input. */
export function toEnglishDigits(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/[۰-۹]/g, (d) => persianToEnglish[d] ?? d)
    .replace(/[٠-٩]/g, (d) => persianToEnglish[d] ?? d);
}

export function formatNumberFa(value: number): string {
  const formatted = new Intl.NumberFormat("en-US").format(value);
  return toPersianDigits(formatted);
}

export function formatDateFa(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const raw = new Intl.DateTimeFormat("fa-IR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);

  return toPersianDigits(raw);
}

export function formatTimeFa(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const raw = new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return toPersianDigits(raw);
}

export function formatPhoneFa(phone: string): string {
  return toPersianDigits(phone);
}

