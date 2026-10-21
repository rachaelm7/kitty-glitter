import { Card, PageHeader, Section, Tag } from "@/core/ui/primitives";
import { MONTH_BILLS, SUBSCRIPTIONS, money } from "../data";

export function FinancesScreen() {
  const total = MONTH_BILLS.reduce((n, b) => n + b.amount, 0);
  const manual = MONTH_BILLS.filter((b) => !b.autopay);
  const quiet = SUBSCRIPTIONS.filter((s) => s.lastUsedDaysAgo > 30);
  const max = Math.max(...MONTH_BILLS.map((b) => b.amount));
  return (
    <div className="max-w-3xl">
      <PageHeader title="Finances" subtitle="A calm look at what's due. Preview with fictional numbers; nothing is connected.">
        <div className="mt-3">
          <Tag tone="champagne">Preview</Tag>
        </div>
      </PageHeader>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-muted">Bills this month</p>
          <p className="font-display text-3xl font-semibold">{money(total)}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Needs paying by hand</p>
          <p className="font-display text-3xl font-semibold">{manual.length}</p>
          <p className="text-sm">{manual.map((b) => b.name).join(", ")}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Quiet subscriptions</p>
          <p className="font-display text-3xl font-semibold">{quiet.length}</p>
          <p className="text-sm">{quiet.map((s) => s.name).join(", ") || "None"}</p>
        </Card>
      </div>

      <Section title="This month's bills" id="bills">
        <Card>
          <ul className="space-y-3">
            {[...MONTH_BILLS].sort((a, b) => a.dayOfMonth - b.dayOfMonth).map((b) => (
              <li key={b.id}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-semibold">{b.name}</span>
                  <span>
                    {money(b.amount)} <span className="text-muted">· day {b.dayOfMonth}</span>
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2" aria-hidden>
                    <span className="block h-full rounded-full bg-champagne/70" style={{ width: `${Math.round((b.amount / max) * 100)}%` }} />
                  </span>
                  <Tag tone={b.autopay ? "neutral" : "urgent"}>{b.autopay ? "Autopay" : "Pay by hand"}</Tag>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </Section>

      <Section title="Subscriptions" id="subs">
        <Card className="py-1">
          <ul>
            {SUBSCRIPTIONS.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-b-0">
                <span>
                  <b className="block font-semibold">{s.name}</b>
                  <span className="text-sm text-muted">{s.lastUsedDaysAgo === 0 ? "Used today" : `Last used ${s.lastUsedDaysAgo} days ago`}</span>
                </span>
                <span className="flex flex-col items-end gap-1">
                  <span className="font-semibold">{money(s.amount)}/mo</span>
                  {s.lastUsedDaysAgo > 30 && <Tag tone="lavender">Worth a look</Tag>}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </Section>
      <p className="mt-6 text-sm text-muted">Coming later: budgets, spending trends and bill reminders, still read-only and private.</p>
    </div>
  );
}
