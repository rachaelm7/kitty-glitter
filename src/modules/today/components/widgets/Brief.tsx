"use client";

import { useStore } from "@/core/store/createStore";
import { Icon } from "@/core/ui/icons";
import { AGENDA } from "@/modules/calendar";
import { composeBrief } from "../../data/brief";
import { needsDoneStore } from "../../data/store";
import { useNeeds } from "./Needs";

export function BriefWidget() {
  const done = useStore(needsDoneStore);
  const open = useNeeds().filter((n) => !done[n.id]);
  return (
    <section aria-label="Morning brief" className="rounded-3xl bg-accent p-5 text-accent-ink">
      <p className="flex items-center gap-1.5 text-sm font-semibold opacity-90">
        <Icon.Sparkle width={16} height={16} /> Morning brief
      </p>
      <p className="mt-1.5 text-[17px] leading-relaxed">{composeBrief(open, AGENDA.length)}</p>
      <p className="mt-2.5 text-[13px] opacity-95">Simulated AI brief from fictional sample mail.</p>
    </section>
  );
}
