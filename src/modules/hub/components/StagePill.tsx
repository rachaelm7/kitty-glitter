import { cx } from "@/core/ui/primitives";
import type { ThreadStage } from "@/modules/threads";

const STYLE: Record<ThreadStage, string> = {
  action: "bg-accent-soft text-accent",
  waiting: "bg-lavender-soft text-lavender",
  scheduled: "bg-champagne-soft text-champagne",
  done: "bg-surface-2 text-muted",
};
export const STAGE_LABEL: Record<ThreadStage, string> = { action: "Needs you", waiting: "Waiting", scheduled: "Scheduled", done: "Done" };

export function StagePill({ stage, children }: { stage: ThreadStage; children?: React.ReactNode }) {
  return <span className={cx("inline-flex flex-none items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", STYLE[stage])}>{children ?? STAGE_LABEL[stage]}</span>;
}
