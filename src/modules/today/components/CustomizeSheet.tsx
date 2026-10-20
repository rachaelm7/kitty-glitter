"use client";

import { useStore } from "@/core/store/createStore";
import { Sheet } from "@/core/ui/Sheet";
import { Button, cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { DEFAULT_LAYOUT, WIDGETS, moveWidget, resolveOrder, toggleWidget } from "../data/layout";
import { layoutStore } from "../data/store";

export function CustomizeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const layout = useStore(layoutStore);
  const order = resolveOrder(layout);

  return (
    <Sheet open={open} onClose={onClose} title="Customize Today">
      <h3 className="pr-12 text-xl">Customize Today</h3>
      <p className="mt-1 text-sm text-muted">Show, hide and reorder widgets. Saved on this device.</p>
      <ul className="mt-4 divide-y divide-line">
        {order.map((id, i) => {
          const w = WIDGETS.find((x) => x.id === id)!;
          const on = !layout.hidden.includes(id);
          return (
            <li key={id} className="flex items-center gap-2 py-2">
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`Show ${w.name}`}
                onClick={() => layoutStore.set((l) => toggleWidget(l, id))}
                className={cx("relative h-7 w-12 flex-none rounded-full transition-colors", on ? "bg-accent" : "bg-line")}
              >
                <span className={cx("absolute top-1 left-1 size-5 rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.25)] transition-transform", on && "translate-x-5")} />
              </button>
              <span className={cx("flex-1", !on && "text-muted")}>{w.name}</span>
              <button
                type="button"
                aria-label={`Move ${w.name} up`}
                disabled={i === 0}
                onClick={() => layoutStore.set((l) => moveWidget(l, id, -1))}
                className="grid size-10 place-items-center rounded-full hover:bg-surface-2 disabled:opacity-30"
              >
                <Icon.Up width={20} height={20} />
              </button>
              <button
                type="button"
                aria-label={`Move ${w.name} down`}
                disabled={i === order.length - 1}
                onClick={() => layoutStore.set((l) => moveWidget(l, id, 1))}
                className="grid size-10 place-items-center rounded-full hover:bg-surface-2 disabled:opacity-30"
              >
                <Icon.Down width={20} height={20} />
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex gap-2">
        <Button onClick={onClose}>Done</Button>
        <Button variant="ghost" onClick={() => layoutStore.set(DEFAULT_LAYOUT)}>
          Reset layout
        </Button>
      </div>
    </Sheet>
  );
}
