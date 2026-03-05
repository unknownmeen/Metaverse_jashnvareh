import * as React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

type AlertVariant = "error" | "success" | "warning";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

const variantStyles: Record<AlertVariant, string> = {
  error: "border-rose-200 bg-rose-50 text-rose-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
};

const variantIcons: Record<AlertVariant, React.ComponentType<{ className?: string }>> = {
  error: AlertCircle,
  success: CheckCircle2,
  warning: AlertCircle,
};

const variantIconColors: Record<AlertVariant, string> = {
  error: "text-rose-600",
  success: "text-emerald-600",
  warning: "text-amber-600",
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "error", children, ...props }, ref) => {
    const Icon = variantIcons[variant];
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "flex items-start gap-3 rounded-xl border px-4 py-3",
          variantStyles[variant],
          className,
        )}
        {...props}
      >
        <Icon className={cn("mt-0.5 h-5 w-5 flex-shrink-0", variantIconColors[variant])} />
        <div className="min-w-0 flex-1 text-sm font-medium leading-relaxed">{children}</div>
      </div>
    );
  },
);
Alert.displayName = "Alert";

export { Alert };
