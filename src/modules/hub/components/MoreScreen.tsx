"use client";

import Link from "next/link";
import { MODULES, type ModuleEntry } from "@/config/modules";
import { untilLabel } from "@/core/date";
import { useStore } from "@/core/store/createStore";
import { PageHeader, Tag, cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { appointmentStore, needsAttention } from "@/modules/appointments";
import { maintenanceStore, nextDue } from "@/modules/home";
import { threadStore } from "@/modules/threads";
import { tripStore } from "@/modules/travel";

const TONE = { accent: "bg-accent-soft text-accent", lavender: "bg-lavender-soft text-lavender", champagne: "bg-champagne-soft text-champagne" };
const PRIMARY = ["threads", "appointments", "travel", "home", "finances", "collections", "settings"];

export function MoreScreen() {
  const threads = useStore(threadStore);
  const appts = useStore(appointmentStore);
  const trips = useStore(tripStore);
  const upkeep = useStore(maintenanceStore);

  const preview: Record<string, string> = {
    threads: `${threads.filter((t) => t.stage === "action").length} need you · ${threads.filter((t) => t.stage === "waiting").length} waiting`,
    appointments: `${appts.filter(needsAttention).length} need attention · ${appts.filter((a) => a.status === "scheduled").length} booked`,
    travel: (() => {
      const next = [...trips].filter((t) => t.startOffset >= 0).sort((a, b) => a.startOffset - b.startOffset)[0];
      return next ? `${next.name} ${untilLabel(next.startOffset)}` : "No trips planned";
    })(),
    home: `${upkeep.filter((m) => nextDue(m).state === "overdue").length} overdue · ${upkeep.filter((m) => nextDue(m).state === "soon").length} due soon`,
    finances: "1 bill to pay by hand",
    collections: "Gifts, books, recipes, cat care",
    settings: "Theme, accounts, demo data",
  };

  const primary = PRIMARY.map((k) => MODULES.find((m) => m.key === k)!).filter(Boolean);
  const extras = MODULES.filter((m) => !PRIMARY.includes(m.key));

  return (
    <div>
      <PageHeader title="More" subtitle="Everything else Kitty Glitter keeps an eye on." />
      <ul className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {primary.map((m, i) => (
          <li key={m.key} className="animate-rise" style={{ animationDelay: `${i * 40}ms` }}>
            <ModuleCard m={m} preview={preview[m.key]} />
          </li>
        ))}
      </ul>

      <h2 className="mt-9 mb-3 text-[21px]">Also here</h2>
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {extras.map((m) => {
          const I = Icon[m.icon];
          return (
            <li key={m.key}>
              <Link href={m.href!} className="flex min-h-16 items-center gap-3 rounded-[22px] border border-line/70 bg-surface p-3.5 shadow-soft transition-shadow hover:shadow-lift">
                <span className={cx("grid size-10 flex-none place-items-center rounded-xl", TONE[m.tone])}>
                  <I />
                </span>
                <span className="min-w-0 flex-1">
                  <b className="block font-semibold">{m.name}</b>
                  <span className="block truncate text-sm text-muted">{m.blurb}</span>
                </span>
                <Icon.Chevron className="text-muted" width={20} height={20} />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ModuleCard({ m, preview }: { m: ModuleEntry; preview?: string }) {
  const I = Icon[m.icon];
  return (
    <Link
      href={m.href!}
      className="group flex h-full flex-col gap-4 rounded-[24px] border border-line/70 bg-surface p-4 shadow-soft transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-lift"
    >
      <span className="flex items-start justify-between">
        <span className={cx("grid size-12 place-items-center rounded-2xl", TONE[m.tone])}>
          <I width={24} height={24} />
        </span>
        {m.status === "preview" ? <Tag tone="champagne">Preview</Tag> : <Icon.Chevron className="text-muted transition-transform group-hover:translate-x-0.5" width={20} height={20} />}
      </span>
      <span>
        <b className="block font-display text-lg font-semibold">{m.name}</b>
        <span className="block text-sm text-muted">{m.blurb}</span>
      </span>
      {preview && <span className="mt-auto rounded-xl bg-surface-2 px-3 py-1.5 text-sm font-semibold">{preview}</span>}
    </Link>
  );
}
