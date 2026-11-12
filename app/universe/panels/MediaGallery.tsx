"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { ProjectMedia } from "../content/projects";

const LIGHTBOX_BUTTON =
  "focus-ring flex h-11 w-11 items-center justify-center rounded-sm border border-ice/30 bg-space-900/80 text-ice-bright hover:border-ice/60 hover:bg-ice/10";

function Lightbox({
  images,
  index,
  onIndex,
  onClose,
}: {
  images: ProjectMedia[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const image = images[index];
  const many = images.length > 1;

  const step = useCallback(
    (delta: number) => onIndex((index + delta + images.length) % images.length),
    [index, images.length, onIndex]
  );

  useEffect(() => {
    const previous = document.activeElement;
    closeRef.current?.focus();
    return () => {
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      } else if (e.key === "ArrowLeft" && many) {
        step(-1);
      } else if (e.key === "ArrowRight" && many) {
        step(1);
      } else if (e.key === "Tab") {
        // Keep focus inside the dialog.
        const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>("button");
        if (!buttons || buttons.length === 0) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [many, onClose, step]);

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
      className="fixed inset-0 z-50 flex flex-col bg-space-950/95 p-3 md:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex shrink-0 items-center justify-between gap-3">
        <p className="hud-label" aria-live="polite">
          {index + 1} / {images.length}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close image"
          className={LIGHTBOX_BUTTON}
        >
          <XMarkIcon aria-hidden className="h-5 w-5" />
        </button>
      </div>
      <div className="pointer-events-none relative my-3 min-h-0 flex-1">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="100vw"
          className="object-contain"
        />
      </div>
      <div className="flex shrink-0 items-center justify-between gap-3">
        <p className="min-w-0 text-sm text-slate-200">{image.alt}</p>
        {many && (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous image"
              className={LIGHTBOX_BUTTON}
            >
              <ChevronLeftIcon aria-hidden className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next image"
              className={LIGHTBOX_BUTTON}
            >
              <ChevronRightIcon aria-hidden className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/** Project screenshots and clips. Looks finished when there are none. */
export function MediaGallery({ media }: { media: ProjectMedia[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);

  if (media.length === 0) {
    return (
      <p className="hud-label border border-dashed border-ice/20 px-3 py-3">
        Screenshots coming soon
      </p>
    );
  }

  const images = media.filter((m) => m.type === "image");
  const videos = media.filter((m) => m.type === "video");

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-2">
          {images.map((image, i) => (
            <li key={image.src}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`View larger: ${image.alt}`}
                className="focus-ring relative block aspect-video w-full overflow-hidden border border-[var(--hud-line)] bg-space-900 hover:border-ice/50"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 768px) 260px, 50vw"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
      {videos.map((video) => (
        <video
          key={video.src}
          src={video.src}
          controls
          playsInline
          preload="metadata"
          aria-label={video.alt}
          className="aspect-video w-full border border-[var(--hud-line)] bg-space-950"
        />
      ))}
      {open !== null && images[open] && (
        <Lightbox images={images} index={open} onIndex={setOpen} onClose={close} />
      )}
    </div>
  );
}
