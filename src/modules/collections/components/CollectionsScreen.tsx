import { PageHeader, Tag, cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { COLLECTIONS } from "../data";

const TONE = { accent: "bg-accent-soft text-accent", lavender: "bg-lavender-soft text-lavender", champagne: "bg-champagne-soft text-champagne" };

export function CollectionsScreen() {
  return (
    <div className="max-w-3xl">
      <PageHeader title="Personal Collections" subtitle="Little lists worth keeping: gifts, books, recipes and the cat. Preview with fictional items.">
        <div className="mt-3">
          <Tag tone="champagne">Preview</Tag>
        </div>
      </PageHeader>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {COLLECTIONS.map((c) => (
          <li key={c.id} className="rounded-[22px] border border-line/70 bg-surface p-4 shadow-soft">
            <div className="flex items-center gap-2.5">
              <span className={cx("grid size-10 place-items-center rounded-2xl", TONE[c.tone])}>{c.id === "cat" ? <Icon.Cat /> : <Icon.Heart />}</span>
              <h2 className="text-lg">{c.name}</h2>
            </div>
            <ul className="mt-3 space-y-1.5 text-[15px]">
              {c.items.map((i) => (
                <li key={i} className="flex gap-2">
                  <Icon.Sparkle width={14} height={14} className="mt-1 flex-none text-champagne" /> {i}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-muted">Coming later: create your own collections and save items from Brain Dump.</p>
    </div>
  );
}
