import { cx } from "@/core/ui/primitives";
import { STATUS_LABEL, type Status } from "../data/types";

export function StatusPill({ status, attention }: { status: Status; attention?: boolean }) {
  return (
    <span
      className={cx(
        "inline-flex flex-none items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        attention ? "bg-urgent-soft text-urgent" : status === "completed" ? "bg-surface-2 text-muted" : "bg-accent-soft text-accent",
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
