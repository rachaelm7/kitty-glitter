export const WIDGETS = [
  { id: "brief", name: "Morning brief", wide: true },
  { id: "priorities", name: "Three priorities" },
  { id: "appointments", name: "Upcoming appointments" },
  { id: "tasks", name: "Tasks needing attention" },
  { id: "email", name: "Important email" },
  { id: "threads", name: "Life Threads" },
  { id: "agenda", name: "Today's agenda" },
  { id: "upcoming", name: "Bills & renewals" },
  { id: "trip", name: "Next trip" },
  { id: "upkeep", name: "Home upkeep" },
  { id: "unread", name: "Unread by account" },
  { id: "promos", name: "Promotions to review" },
] as const;

export type WidgetId = (typeof WIDGETS)[number]["id"];
export type Layout = { order: WidgetId[]; hidden: WidgetId[] };

export const DEFAULT_LAYOUT: Layout = { order: WIDGETS.map((w) => w.id), hidden: ["unread", "promos"] };

/** Saved order first, then any widgets added since the layout was saved. Unknown ids are dropped. */
export function resolveOrder(layout: Layout): WidgetId[] {
  const known = new Set<WidgetId>(WIDGETS.map((w) => w.id));
  const saved = layout.order.filter((id) => known.has(id));
  return [...saved, ...WIDGETS.map((w) => w.id).filter((id) => !saved.includes(id))];
}

export function visibleWidgets(layout: Layout): WidgetId[] {
  return resolveOrder(layout).filter((id) => !layout.hidden.includes(id));
}

export function moveWidget(layout: Layout, id: WidgetId, dir: -1 | 1): Layout {
  const order = resolveOrder(layout);
  const i = order.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= order.length) return layout;
  [order[i], order[j]] = [order[j], order[i]];
  return { ...layout, order };
}

export function toggleWidget(layout: Layout, id: WidgetId): Layout {
  const hidden = layout.hidden.includes(id) ? layout.hidden.filter((h) => h !== id) : [...layout.hidden, id];
  return { ...layout, hidden };
}
