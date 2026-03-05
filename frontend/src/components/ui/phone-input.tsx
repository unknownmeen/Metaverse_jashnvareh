import * as React from "react";

import { toPersianDigits, toEnglishDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  /** Display value (Persian digits). Parent stores Persian; convert with toEnglishDigits when submitting. */
  value: string;
  onChange: (value: string) => void;
}

/**
 * Phone input matching website behavior: stores/display Persian digits.
 * Parent passes value as Persian (or English—will be shown as Persian).
 * On change, returns Persian. Use toEnglishDigits(value).replace(/\D/g, '') when submitting.
 */
const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const displayValue = toPersianDigits(toEnglishDigits(value));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const normalized = toEnglishDigits(e.target.value).replace(/\D/g, "").slice(0, 11);
      onChange(toPersianDigits(normalized));
    };

    return (
      <input
        ref={ref}
        type="tel"
        inputMode="numeric"
        dir="ltr"
        value={displayValue}
        onChange={handleChange}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-border bg-white px-4 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary",
          className,
        )}
        {...props}
      />
    );
  },
);
PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
