"use client";

import { useState, type ComponentType } from "react";
import { DEMO_USER_NAME } from "@/config/demo";
import { formatLongDate, greeting, useNow } from "@/core/date";
import { useStore } from "@/core/store/createStore";
import { ErrorBoundary } from "@/core/ui/ErrorBoundary";
import { Button, DemoBadge, EmptyState, PageHeader, cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { WIDGETS, visibleWidgets, type WidgetId } from "../data/layout";
import { layoutStore } from "../data/store";
import { CustomizeSheet } from "./CustomizeSheet";
import { AgendaWidget } from "./widgets/Agenda";
import { BriefWidget } from "./widgets/Brief";
import { PromosWidget, UnreadWidget } from "./widgets/Mail";
import { AppointmentsWidget, CaptureWidget, TripWidget, UpkeepWidget } from "./widgets/Modules";
import { NeedsWidget } from "./widgets/Needs";
import { UpcomingWidget } from "./widgets/Upcoming";

const COMPONENTS: Record<WidgetId, ComponentType> = {
  brief: BriefWidget,
  needs: NeedsWidget,
  appointments: AppointmentsWidget,
  agenda: AgendaWidget,
  upcoming: UpcomingWidget,
  unread: UnreadWidget,
  promos: PromosWidget,
  trip: TripWidget,
  upkeep: UpkeepWidget,
  capture: CaptureWidget,
};

export function TodayScreen() {
  const now = useNow();
  const layout = useStore(layoutStore);
  const [customizing, setCustomizing] = useState(false);
  const ids = visibleWidgets(layout);

  return (
    <div>
      <PageHeader title={`${greeting(now)}, ${DEMO_USER_NAME}`} subtitle={formatLongDate(now)}>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <DemoBadge />
          <Button size="sm" variant="quiet" onClick={() => setCustomizing(true)}>
            <Icon.Grid width={16} height={16} /> Customize
          </Button>
        </div>
      </PageHeader>

      {ids.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="A blank slate" icon={<Icon.Grid />}>
            Every widget is hidden.{" "}
            <Button size="sm" variant="quiet" onClick={() => setCustomizing(true)}>
              Choose widgets
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
