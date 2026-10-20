"use client";

import Link from "next/link";
import { resetAllStores } from "@/core/store/createStore";
import { setTheme, useTheme, type ThemeChoice } from "@/core/theme/theme";
import { Button, Card, PageHeader, Section, Segmented, Tag } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { useToast } from "@/core/ui/Toast";
import { AccountDot, emailProvider } from "@/modules/email";

export function SettingsScreen() {
  const theme = useTheme();
  const toast = useToast();
  const accounts = emailProvider.listAccounts();

  return (
    <div className="max-w-2xl">
      <Link href="/more" className="mb-4 inline-flex min-h-11 items-center gap-1 font-semibold text-accent">
        <Icon.Back width={20} height={20} /> More
      </Link>
      <PageHeader title="Settings" subtitle="Appearance, accounts and demo data" />

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

      <Section title="For design review" id="design">
        <Link href="/more/states" className="flex min-h-14 items-center gap-3 rounded-[22px] border border-line/70 bg-surface shadow-soft p-3.5 transition-colors hover:bg-surface-2">
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
            DEMO MODE: every person, email, appointment and amount here is fictional. Changes are saved only in this browser, nothing is connected to real accounts, and the app never sends email or contacts anyone.
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
