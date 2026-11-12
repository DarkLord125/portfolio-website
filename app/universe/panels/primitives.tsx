import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/util";

/**
 * Small building blocks shared by the holographic panels and the /lite page.
 * No hooks and no "use client": they render on the server as well.
 */

export type HeadingLevel = 2 | 3 | 4 | 5;
const headingTag = (level: HeadingLevel) => `h${level}` as "h2" | "h3" | "h4" | "h5";

/** Sets the small per-destination accent colour for everything inside. */
export const accentStyle = (color: string): CSSProperties =>
  ({ "--accent": color }) as CSSProperties;

export function HoloSection({
  label,
  level = 3,
  aside,
  className,
  children,
}: {
  label: string;
  level?: HeadingLevel;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const Heading = headingTag(level);
  return (
    <section className={className}>
      <div className="mb-3 flex items-center gap-3">
        <Heading className="hud-label shrink-0">{label}</Heading>
        <span aria-hidden className="h-px flex-1 bg-[var(--hud-line)]" />
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Chip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-ice/20 bg-ice/5 px-2 py-1 font-mono text-[11px] leading-none text-slate-200",
        className
      )}
    >
      {children}
    </span>
  );
}

export function ChipList({
  items,
  label,
  className,
}: {
  items: readonly string[];
  label?: string;
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <ul aria-label={label} className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((item) => (
        <li key={item} className="flex">
          <Chip>{item}</Chip>
        </li>
      ))}
    </ul>
  );
}

export function DataList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <dl className={cn("border-t border-[var(--hud-line)]", className)}>{children}</dl>;
}

export function DataRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--hud-line)] py-2">
      <dt className="hud-label shrink-0">{label}</dt>
      <dd className="hud-value min-w-0 text-right">{value}</dd>
    </div>
  );
}

/** A small holographic sub-panel: accent tick, title, one short paragraph. */
export function HoloCard({
  title,
  level = 4,
  index,
  className,
  children,
}: {
  title: string;
  level?: HeadingLevel;
  /** Optional ordinal shown as HUD data, e.g. 1 → "01". */
  index?: number;
  className?: string;
  children: ReactNode;
}) {
  const Heading = headingTag(level);
  return (
    <div
      className={cn(
        "relative border border-[var(--hud-line)] bg-space-900/40 p-3 pl-4",
        className
      )}
    >
      <span
        aria-hidden
        className="absolute left-0 top-3 h-4 w-0.5 bg-[var(--accent,#9fd0ff)]"
      />
      <div className="flex items-baseline justify-between gap-3">
        <Heading className="font-display text-[15px] font-medium text-slate-50">
          {title}
        </Heading>
        {index !== undefined && (
          <span aria-hidden className="hud-label">
            {String(index).padStart(2, "0")}
          </span>
        )}
      </div>
      <div className="mt-1 text-sm leading-relaxed text-slate-300">{children}</div>
    </div>
  );
}

/** List with small accent markers instead of bullets. */
export function MarkerList({
  items,
  className,
}: {
  items: readonly string[];
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <ul className={cn("space-y-2", className)}>
      {items.map((item) => (
        <li
          key={item}
          className="relative pl-4 text-sm leading-relaxed text-slate-300"
        >
          <span
            aria-hidden
            className="absolute left-0 top-[0.6em] h-1 w-1 rotate-45 bg-[var(--accent,#9fd0ff)]"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

export type ActionVariant = "primary" | "ghost";

/** Shared look for buttons and button-like links (≥ 44px tall). */
export const actionClass = (variant: ActionVariant = "ghost", className?: string) =>
  cn(
    "focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-sm px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] transition-colors disabled:cursor-not-allowed disabled:opacity-60",
    variant === "primary"
      ? "bg-ember font-semibold text-space-950 hover:bg-[#ffd29b]"
      : "border border-ice/30 text-ice-bright hover:border-ice/60 hover:bg-ice/10",
    className
  );

export function ActionLink({
  variant = "ghost",
  external = false,
  className,
  children,
  ...rest
}: {
  variant?: ActionVariant;
  /** Opens in a new tab with rel="noopener noreferrer". */
  external?: boolean;
} & ComponentPropsWithoutRef<"a">) {
  return (
    <a
      {...rest}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={actionClass(variant, className)}
    >
      {children}
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}
