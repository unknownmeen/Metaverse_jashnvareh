import type { User } from "@/types/models";

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

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (digit) => digitMap[digit] ?? digit);
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

export function getGenderLabel(gender: User["gender"]): string {
  return gender === "female" ? "زن" : "مرد";
}

export function getRoleLabel(role: User["role"]): string {
  switch (role) {
    case "admin":
      return "ادمین";
    case "judge":
      return "داور";
    default:
      return "کاربر";
  }
}
