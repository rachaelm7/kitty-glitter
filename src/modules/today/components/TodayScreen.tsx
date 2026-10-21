"use client";

import Link from "next/link";
import { useState, type ComponentType } from "react";
import { DEMO_USER_NAME } from "@/config/demo";
import { formatLongDate, greeting, useNow } from "@/core/date";
import { useStore } from "@/core/store/createStore";
import { ErrorBoundary } from "@/core/ui/ErrorBoundary";
import { Button, EmptyState, cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { WIDGETS, visibleWidgets, type WidgetId } from "../data/layout";
import { layoutStore } from "../data/store";
import { CustomizeSheet } from "./CustomizeSheet";
import { AgendaWidget } from "./widgets/Agenda";
import { BriefWidget } from "./widgets/Brief";
import { ChangesWidget } from "./widgets/Changes";
import { AppointmentsWidget, EmailWidget, TasksWidget, ThreadsWidget } from "./widgets/Glance";
import { PromosWidget, UnreadWidget } from "./widgets/Mail";
import { TripWidget, UpkeepWidget } from "./widgets/Modules";
import { PrioritiesWidget } from "./widgets/Priorities";
import { UpcomingWidget } from "./widgets/Upcoming";

const COMPONENTS: Record<WidgetId, ComponentType> = {
  brief: BriefWidget,
  changes: ChangesWidget,
  priorities: PrioritiesWidget,
  appointments: AppointmentsWidget,
  tasks: TasksWidget,
  email: EmailWidget,
  threads: ThreadsWidget,
  agenda: AgendaWidget,
  upcoming: UpcomingWidget,
  trip: TripWidget,
  upkeep: UpkeepWidget,
  unread: UnreadWidget,
  promos: PromosWidget,
};

export function TodayScreen() {
  const now = useNow();
  const layout = useStore(layoutStore);
  const [customizing, setCustomizing] = useState(false);
  const ids = visibleWidgets(layout);

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 animate-rise">
        <div>
          <p className="text-sm font-semibold text-muted">{formatLongDate(now)}</p>
          <h1 className="mt-1 text-[34px] leading-[1.1] lg:text-[42px]">
            {greeting(now)}, {DEMO_USER_NAME}
            <Icon.Sparkle aria-hidden className="ml-1.5 inline-block -translate-y-3 text-champagne" width={18} height={18} />
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/capture"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 font-semibold text-accent-ink shadow-soft transition-transform active:scale-[0.98]"
          >
            <Icon.Plus width={18} height={18} /> Quick capture
          </Link>
          <Button variant="ghost" onClick={() => setCustomizing(true)}>
            <Icon.Grid width={18} height={18} /> Customize
          </Button>
        </div>
      </header>

      {ids.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="A blank slate" icon={<Icon.Grid />}>
            Every card is hidden.{" "}
            <Button size="sm" variant="quiet" onClick={() => setCustomizing(true)}>
              Choose cards
            </Button>
          </EmptyState>
        </div>
      ) : (
        <div className="mt-6 grid gap-7 lg:grid-cols-2 lg:gap-x-8">
          {ids.map((id, i) => {
            const W = COMPONENTS[id];
            const wide = WIDGETS.find((w) => w.id === id && "wide" in w);
            return (
              <div key={id} className={cx("min-w-0 animate-rise", wide && "lg:col-span-2")} style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                <ErrorBoundary name={WIDGETS.find((w) => w.id === id)!.name}>
                  <W />
                </ErrorBoundary>
              </div>
            );
          })}
        </div>
      )}

      <CustomizeSheet open={customizing} onClose={() => setCustomizing(false)} />
    </div>
  );
}
