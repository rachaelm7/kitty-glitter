import { cx } from "@/core/ui/primitives";
import { stepIndex } from "../data/logic";
import { STATUSES, STATUS_LABEL, type Status } from "../data/types";

/** Six-step bar on cards: where this appointment is in its journey. */
export function ProgressBar({ status }: { status: Status }) {
  const at = stepIndex(status);
  return (
    <div className="flex gap-1" role="img" aria-label={`Step ${at + 1} of ${STATUSES.length}: ${STATUS_LABEL[status]}`}>
      {STATUSES.map((s, i) => (
        <span key={s} className={cx("h-1.5 flex-1 rounded-full", i <= at ? "bg-accent" : "bg-surface-2")} />
      ))}
    </div>
  );
}

/** Vertical stepper in the detail sheet. */
export function Stepper({ status }: { status: Status }) {
  const at = stepIndex(status);
  return (
    <ol className="relative ml-1.5 border-l-2 border-line pl-5">
      {STATUSES.map((s, i) => (
        <li key={s} className="relative pb-3 last:pb-0" aria-current={i === at ? "step" : undefined}>
          <span
            aria-hidden
            className={cx(
              "absolute top-1 -left-[29px] size-4 rounded-full border-2",
              i < at && "border-accent bg-accent",
              i === at && "border-accent bg-surface ring-4 ring-accent-soft",
              i > at && "border-line bg-surface",
            )}
          />
          <span className={cx("text-sm", i === at ? "font-bold" : i < at ? "text-ink" : "text-muted")}>{STATUS_LABEL[s]}</span>
        </li>
      ))}
    </ol>
  );
}
