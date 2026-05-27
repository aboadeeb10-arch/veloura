"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type StoryData = {
  id: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  thumbnailUrl: string | null;
  caption: string;
};

const DURATION = 5000;

export function StoriesRow({ stories }: { stories: StoryData[] }) {
  const [active, setActive] = useState<number | null>(null);
  if (stories.length === 0) return null;

  return (
    <>
      <div className="no-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 py-1 sm:justify-center sm:gap-6">
        {stories.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActive(i)}
            className="flex shrink-0 flex-col items-center gap-1.5"
          >
            <span className="rounded-full bg-gradient-to-tr from-gold via-gold-light to-cream-300 p-[2.5px]">
              <span className="block rounded-full bg-cream-50 p-[3px]">
                <span className="relative block h-16 w-16 overflow-hidden rounded-full sm:h-[76px] sm:w-[76px]">
                  <Image
                    src={s.thumbnailUrl || s.mediaUrl}
                    alt={s.caption}
                    fill
                    sizes="76px"
                    className="object-cover"
                  />
                </span>
              </span>
            </span>
            <span className="max-w-[80px] truncate text-xs text-ink-soft">
              {s.caption}
            </span>
          </button>
        ))}
      </div>

      {active !== null && (
        <StoryViewer
          stories={stories}
          startIndex={active}
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}

function StoryViewer({
  stories,
  startIndex,
  onClose,
}: {
  stories: StoryData[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const story = stories[index];

  useEffect(() => {
    const t = setTimeout(() => {
      setIndex((i) => {
        if (i + 1 < stories.length) return i + 1;
        onClose();
        return i;
      });
    }, DURATION);
    return () => clearTimeout(t);
  }, [index, stories.length, onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight")
        setIndex((i) => Math.min(i + 1, stories.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [stories.length, onClose]);

  function goNext() {
    if (index + 1 < stories.length) setIndex(index + 1);
    else onClose();
  }
  function goPrev() {
    if (index > 0) setIndex(index - 1);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95">
      <div className="relative h-full w-full max-w-[460px] sm:h-[92vh] sm:rounded-2xl sm:bg-black">
        {/* progress bars */}
        <div className="absolute inset-x-3 top-3 z-20 flex gap-1.5">
          {stories.map((s, i) => (
            <span
              key={s.id}
              className="h-1 flex-1 overflow-hidden rounded-full bg-white/30"
            >
              <span
                className={cn(
                  "block h-full rounded-full bg-white",
                  i < index && "w-full",
                  i > index && "w-0",
                )}
                style={
                  i === index
                    ? { animation: `story-fill ${DURATION}ms linear forwards` }
                    : undefined
                }
              />
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute end-3 top-6 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* media */}
        <div className="relative h-full w-full overflow-hidden sm:rounded-2xl">
          {story.mediaType === "VIDEO" ? (
            <video
              key={story.id}
              src={story.mediaUrl}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <Image
              key={story.id}
              src={story.mediaUrl}
              alt={story.caption}
              fill
              sizes="460px"
              className="object-cover"
            />
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pb-8">
            <p className="text-center text-sm font-medium text-white">
              {story.caption}
            </p>
          </div>
        </div>

        {/* tap zones */}
        <button
          type="button"
          aria-label="Previous"
          onClick={goPrev}
          className="absolute inset-y-0 start-0 z-10 w-1/3"
        />
        <button
          type="button"
          aria-label="Next"
          onClick={goNext}
          className="absolute inset-y-0 end-0 z-10 w-2/3"
        />
      </div>
    </div>
  );
}
