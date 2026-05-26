import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Veloura wordmark. Swap in the real logo file by replacing the <span>
 * markup below with an <Image> once the logo asset is in /public.
 */
export function Logo({
  className,
  tone = "ink",
}: {
  className?: string;
  tone?: "ink" | "light";
}) {
  return (
    <Link
      href="/"
      aria-label="Veloura"
      className={cn("inline-flex items-baseline gap-1", className)}
    >
      <span
        className={cn(
          "font-serif text-2xl tracking-wide sm:text-[1.6rem]",
          tone === "light" ? "text-white" : "text-ink",
        )}
      >
        Veloura
      </span>
      <span className="h-1.5 w-1.5 rounded-full bg-gold" />
    </Link>
  );
}
