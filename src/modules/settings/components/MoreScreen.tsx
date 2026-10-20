"use client";

import Link from "next/link";
import { MODULES } from "@/config/modules";
import { resetAllStores } from "@/core/store/createStore";
import { setTheme, useTheme, type ThemeChoice } from "@/core/theme/theme";
import { Button, Card, PageHeader, Section, Segmented, Tag } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { useToast } from "@/core/ui/Toast";
import { AccountDot, emailProvider } from "@/modules/email";

export function MoreScreen() {
  const theme = useTheme();
  const toast = useToast();
  const accounts = emailProvider.listAccounts();
  const live = MODULES.filter((m) => m.status === "live" && m.href && !["/inbox", "/tasks"].includes(m.href));
  const planned = MODULES.filter((m) => m.status === "planned");

  return (
    <div className="max-w-2xl">
      <PageHeader title="More" subtitle="Settings, modules and what's coming next" />

      {live.length > 0 && (
        <Section title="Modules" id="modules-live">
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {live.map((m) => {
              const I = Icon[m.icon];
              return (
                <li key={m.key}>
                  <Link href={m.href!} className="flex min-h-16 items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 transition-colors hover:bg-surface-2">
                    <span className="grid size-10 flex-none place-items-center rounded-xl bg-accent-soft text-accent">
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
        </Section>
      )}

      <Section title="Appearance" id="appearance">
        <Segmented<ThemeChoice>
          label="Theme"
          value={theme}
          onChange={setTheme}
          options={[
            { value: "auto", label: "Auto" },
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
        />
        <p className="mt-2 text-sm text-muted">Auto follows your device setting.</p>
      </Section>

      <Section title="Email accounts" id="accounts">
        <Card className="py-1">
          <ul>
            {accounts.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-b-0">
                <span className="min-w-0">
                  <span className="flex items-center gap-2 font-semibold">
                    <AccountDot account={a.id} /> {a.name}
                  </span>
                  <span className="block truncate text-sm text-muted">{a.address}</span>
                </span>
                {a.connected ? <Tag>Sample · read-only</Tag> : <Tag tone="neutral">Connect later</Tag>}
              </li>
            ))}
          </ul>
        </Card>
        <p className="mt-2 text-sm text-muted">Every account and address here is fictional. Email stays read-only; drafts only.</p>
      </Section>

      <Section title="Planned modules" id="planned">
        <Card className="py-1">
          <ul>
            {planned.map((m) => (
              <li key={m.key} className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-b-0">
                <span className="min-w-0">
                  <span className="block font-semibold">{m.name}</span>
                  <span className="block text-sm text-muted">{m.blurb}</span>
                </span>
                <Tag tone="neutral">Planned</Tag>
              </li>
            ))}
          </ul>
        </Card>
      </Section>

      <Section title="For design review" id="design">
        <Link href="/more/states" className="flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 transition-colors hover:bg-surface-2">
          <span className="grid size-10 flex-none place-items-center rounded-xl bg-accent-soft text-accent">
            <Icon.Grid />
          </span>
          <span className="flex-1">
            <b className="block font-semibold">State gallery</b>
            <span className="text-sm text-muted">Empty, loading and error states in one place</span>
          </span>
          <Icon.Chevron className="text-muted" width={20} height={20} />
        </Link>
      </Section>

      <Section title="Demo data" id="demo">
        <Card>
          <p className="text-sm">
            This is a demo with fictional data. Changes you make are saved only in this browser and nothing is connected to real accounts.
          </p>
          <Button
            variant="ghost"
            className="mt-3"
            onClick={() => {
              resetAllStores();
              toast("Sample data restored");
            }}
          >
            Reset demo data
          </Button>
        </Card>
      </Section>
    </div>
  );
}
