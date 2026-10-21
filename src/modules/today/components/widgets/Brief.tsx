"use client";

import { useStore } from "@/core/store/createStore";
import { Icon } from "@/core/ui/icons";
import { appointmentStore } from "@/modules/appointments";
import { useChanges } from "@/modules/hub";
import { composeBrief } from "../../data/brief";
import { needsDoneStore } from "../../data/store";
import { usePriorities } from "./Priorities";

export function BriefWidget() {
  const done = useStore(needsDoneStore);
  const open = usePriorities().filter((n) => !done[n.id]);
  const { summary } = useChanges();
  const soon = useStore(appointmentStore).filter((a) => a.when && a.when.dayOffset === 0).length;
  return (
    <section aria-label="Morning brief" className="relative overflow-hidden rounded-[28px] border border-line/70 bg-surface p-5 shadow-soft sm:p-6">
      <span aria-hidden className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-lavender-soft" />
      <span aria-hidden className="pointer-events-none absolute -right-2 -bottom-12 size-28 rounded-full bg-accent-soft" />
      <div className="relative">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-accent">
          <Icon.Sparkle width={16} height={16} /> Morning brief
        </p>
        <p className="mt-2 max-w-2xl font-display text-[19px] leading-relaxed sm:text-[21px]">{composeBrief(open, soon)}</p>
        <p className="mt-3 text-sm">
          <b className="font-semibold">Since yesterday:</b> {summary}
        </p>
        <p className="mt-2 text-[13px] text-muted">Simulated AI brief, written from fictional sample data.</p>
      </div>
    </section>
  );
}
