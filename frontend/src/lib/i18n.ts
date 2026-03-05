import fa from "@/locales/fa.json";
import { toPersianDigits } from "./format";

const translations = fa as Record<string, unknown>;

/**
 * Get a translated string by dot-notation key.
 * Supports interpolation with {{param}} syntax.
 *
 * @example
 *   t('errors.auth.unauthorized')
 *   t('time.minutes_ago', { count: 5 })
 *
 * @param key - Dot-separated translation key
 * @param params - Interpolation parameters
 * @returns The translated string, or the key itself if not found
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const keys = key.split(".");
  let result: unknown = translations;

  for (const k of keys) {
    if (result && typeof result === "object" && k in result) {
      result = (result as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }

  if (typeof result !== "string") return key;

  if (params) {
    return result.replace(/\{\{(\w+)\}\}/g, (_, name: string) => {
      if (!(name in params)) return `{{${name}}}`;
      const val = params[name];
      return typeof val === "number" ? toPersianDigits(val) : String(val);
    });
  }

  return result;
}
