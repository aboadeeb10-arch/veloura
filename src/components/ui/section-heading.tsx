import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-8 sm:mb-12",
        align === "center" ? "text-center" : "text-start",
        className,
      )}
    >
      {eyebrow && <p className="heading-eyebrow mb-2">{eyebrow}</p>}
      <h2 className="text-3xl text-ink sm:text-4xl">{title}</h2>
      {subtitle && (
        <p
          className={cn(
            "mt-3 text-ink-soft",
            align === "center" && "mx-auto max-w-xl",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
