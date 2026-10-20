import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "./icons";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "urgent" | "quiet";
  size?: "md" | "sm";
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45",
        size === "md" ? "min-h-11 px-4 text-[15px]" : "min-h-9 px-3 text-sm",
        variant === "primary" && "bg-accent text-accent-ink hover:brightness-105",
        variant === "urgent" && "bg-urgent text-urgent-ink hover:brightness-105",
        variant === "ghost" && "border-[1.5px] border-line bg-surface text-ink hover:bg-surface-2",
        variant === "quiet" && "text-accent hover:bg-accent-soft",
        className,
      )}
      {...props}
    />
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("rounded-2xl border border-line bg-surface p-4", className)}>{children}</div>;
}

export function Section({
  title,
  action,
  children,
  className,
  id,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section className={cx("mt-8", className)} aria-labelledby={id}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id={id} className="text-[21px] leading-tight">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children?: ReactNode }) {
  return (
    <header className="animate-rise">
      <h1 className="text-[32px] leading-[1.12] lg:text-[38px]">{title}</h1>
      {subtitle && <p className="mt-1.5 text-muted">{subtitle}</p>}
      {children}
    </header>
  );
}

export function Tag({ children, tone = "accent" }: { children: ReactNode; tone?: "accent" | "urgent" | "neutral" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tone === "accent" && "bg-accent-soft text-accent",
        tone === "urgent" && "bg-urgent-soft text-urgent",
        tone === "neutral" && "bg-surface-2 text-muted",
      )}
    >
      {children}
    </span>
  );
}

export function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cx(
        "flex min-h-10 flex-none items-center gap-2 rounded-full border-[1.5px] px-3.5 text-sm font-medium transition-colors",
        pressed ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface hover:bg-surface-2",
      )}
    >
      {children}
    </button>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-2xl bg-surface-2 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            "min-h-10 flex-1 rounded-xl px-2 text-[15px] font-semibold transition-colors",
            value === o.value ? "bg-surface text-ink shadow-[0_1px_0_var(--line)]" : "text-muted hover:text-ink",
          )}
        >
          {o.label}
          {o.count !== undefined && <span className="ml-1 font-normal text-muted">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function CheckCircle({
  checked,
  onToggle,
  label,
  tone = "accent",
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  tone?: "accent" | "urgent";
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={cx(
        "grid size-7 flex-none place-items-center rounded-full border-2 transition-colors",
        checked
          ? "animate-pop border-accent bg-accent text-accent-ink"
          : tone === "urgent"
            ? "border-urgent"
            : "border-accent",
      )}
    >
      {checked && <Icon.Check width={16} height={16} />}
    </button>
  );
}

export function Dot({ color, className }: { color: string; className?: string }) {
  return <span aria-hidden className={cx("inline-block size-2.5 flex-none rounded-full", className)} style={{ background: color }} />;
}

export function EmptyState({ title, children, icon }: { title: string; children?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line px-6 py-10 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-accent-soft text-accent">{icon ?? <Icon.Sparkle />}</div>
      <p className="font-display text-lg font-semibold">{title}</p>
      {children && <div className="max-w-sm text-sm text-muted">{children}</div>}
    </div>
  );
}

export function ErrorState({ title, children, onRetry }: { title: string; children?: ReactNode; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-urgent/40 bg-urgent-soft p-4">
      <p className="font-semibold text-urgent">{title}</p>
      {children && <div className="mt-1 text-sm">{children}</div>}
      {onRetry && (
        <Button variant="ghost" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function SkeletonRows({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading" className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="space-y-2 rounded-2xl border border-line bg-surface p-4">
          <div className="skeleton h-3.5 w-1/3" />
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-3.5 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-[13px] font-semibold text-accent">
      <Icon.Sparkle width={14} height={14} /> Demo · fictional data
    </span>
  );
}
