import type { ReactNode } from "react";
import { cx } from "./primitives";

/** Shared look for text inputs, selects and date pickers in forms. */
export const inputClass = "mt-1 min-h-11 w-full min-w-0 rounded-2xl border-[1.5px] border-line bg-bg px-3.5 aria-invalid:border-urgent";

/**
 * A labelled form field with an optional hint and error. The control is passed as a
 * render function so it receives the ids it needs for aria-describedby.
 */
export function Field({
  id,
  label,
  optional,
  hint,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: ReactNode;
  error?: string;
  className?: string;
  children: (aria: { id: string; "aria-invalid"?: true; "aria-describedby"?: string }) => ReactNode;
}) {
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cx("min-w-0", className)}>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </label>
      {children({ id, ...(error ? { "aria-invalid": true as const } : {}), "aria-describedby": describedBy })}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-urgent">
          {error}
        </p>
      )}
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
