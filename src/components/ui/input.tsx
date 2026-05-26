import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink placeholder:text-ink-muted",
      "focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25 disabled:opacity-60",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[96px] w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-muted",
      "focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
