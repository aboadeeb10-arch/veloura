"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type HeroSlideData = {
  id: string;
  image: string;
  headline: string;
  subtext: string;
  ctaLabel: string | null;
  ctaHref: string | null;
};

export function HeroCarousel({ slides }: { slides: HeroSlideData[] }) {
  const [index, setIndex] = useState(0);
  const count = slides.length;
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (n: number) => setIndex(((n % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 6500);
    return () => clearInterval(id);
  }, [count]);

  if (count === 0) return null;

  return (
    <section
      className="relative h-[70vh] min-h-[460px] w-full overflow-hidden bg-ink sm:h-[80vh]"
      aria-roledescription="carousel"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-out",
            i === index ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          aria-hidden={i !== index}
        >
          <Image
            src={slide.image}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/35 to-ink/20" />
          <div className="container-wide relative flex h-full flex-col items-center justify-center text-center">
            <h1 className="max-w-2xl text-3xl font-medium text-white drop-shadow-sm sm:text-5xl">
              {slide.headline}
            </h1>
            {slide.subtext && (
              <p className="mt-4 max-w-xl text-sm text-cream-100 sm:text-lg">
                {slide.subtext}
              </p>
            )}
            <Link
              href={slide.ctaHref || "/book"}
              className="mt-7 inline-flex h-12 items-center rounded-full bg-gold px-8 text-sm font-medium text-white transition-colors hover:bg-gold-dark"
            >
              {slide.ctaLabel || "Book Now"}
            </Link>
          </div>
        </div>
      ))}

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
            className="absolute start-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink shadow-soft transition hover:bg-white sm:flex"
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next slide"
            className="absolute end-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink shadow-soft transition hover:bg-white sm:flex"
          >
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </button>

          <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === index ? "w-7 bg-white" : "w-2 bg-white/50",
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
