"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "@/core/store/createStore";
import { Sheet } from "@/core/ui/Sheet";
import { Button, Card, PageHeader, Segmented, cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { defaultPlan, generateRescueInbox, PILES, protectReason, senderCounts, splitInbox, summarizePlan, ACTION_LABEL, type PileAction, type PileId, type RescueMessage } from "../data/rescue";
import { rescuePlanStore } from "../data/store";
import { AccountDot } from "./AccountDot";

type Step = "start" | "piles" | "review" | "done";

export function RescueScreen() {
  const inbox = useMemo(() => generateRescueInbox(), []);
  const { protectedMsgs, piles } = useMemo(() => splitInbox(inbox), [inbox]);
  const plan = useStore(rescuePlanStore);
  const summary = summarizePlan(inbox, plan);
  const [step, setStep] = useState<Step>("start");
  const [preview, setPreview] = useState<PileId | "protected" | null>(null);

  return (
    <div className="max-w-3xl">
      <Link href="/inbox" className="mb-4 inline-flex min-h-11 items-center gap-1 font-semibold text-accent">
        <Icon.Back width={20} height={20} /> Inbox
      </Link>
      <PageHeader title="Rescue Mode" subtitle="A calm way through a big unread pile. Nothing happens until you confirm, and important mail is never touched." />
      <Stepper step={step} />

      {step === "start" && (
        <div className="mt-6 space-y-4 animate-rise">
          <Card>
            <p className="text-sm text-muted">Unread across five fictional accounts</p>
            <p className="font-display text-5xl font-semibold">{inbox.length}</p>
            <p className="mt-2">That&apos;s a lot, and that&apos;s okay. Most of it is newsletters, offers and automatic updates.</p>
          </Card>
          <ProtectedCard count={protectedMsgs.length} onOpen={() => setPreview("protected")} />
          <Card>
            <p className="font-semibold">The rest sorts into {PILES.length} piles</p>
            <ul className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
              {PILES.map((p) => (
                <li key={p.id} className="rounded-xl bg-surface-2 px-3 py-2">
                  <b className="font-semibold">{piles[p.id].length}</b> {p.name.toLowerCase()}
                </li>
              ))}
            </ul>
            <Button className="mt-4" onClick={() => setStep("piles")}>
              Start sorting
            </Button>
          </Card>
        </div>
      )}

      {step === "piles" && (
        <div className="mt-6">
          <ProtectedCard count={protectedMsgs.length} onOpen={() => setPreview("protected")} compact />
          <ul className="mt-4 space-y-3">
            {PILES.map((p) => {
              const msgs = piles[p.id];
              const top = senderCounts(msgs).slice(0, 3);
              return (
                <li key={p.id} className="rounded-2xl border border-line bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg leading-tight">
                        {p.name} <span className="font-sans text-base font-normal text-muted">· {msgs.length}</span>
                      </h2>
                      <p className="text-sm text-muted">{p.blurb}</p>
                      <p className="mt-1 truncate text-sm">{top.map(([s, n]) => `${s} (${n})`).join(", ")}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setPreview(p.id)}>
                      Preview
                    </Button>
                  </div>
                  <div className="mt-3">
                    <Segmented<PileAction>
                      label={`Action for ${p.name}`}
                      value={plan[p.id]}
                      onChange={(a) => rescuePlanStore.set((pl) => ({ ...pl, [p.id]: a }))}
                      options={[
                        { value: "mark-read", label: "Mark read" },
                        { value: "archive", label: "Archive" },
                        { value: "leave", label: "Leave" },
                      ]}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <BottomBar>
            <span className="text-sm">
              {summary.markRead + summary.archive} of {inbox.length} planned
            </span>
            <button type="button" onClick={() => setStep("review")} className="inline-flex min-h-11 items-center rounded-xl bg-bg px-4 font-semibold text-ink">
              Review plan
            </button>
          </BottomBar>
        </div>
      )}

      {step === "review" && (
        <div className="mt-6 space-y-4">
          <Card>
            <h2 className="text-xl">Your plan</h2>
            <ul className="mt-3 divide-y divide-line">
              {PILES.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span>
                    {p.name} <span className="text-muted">· {piles[p.id].length}</span>
                  </span>
                  <span className={cx("text-sm font-semibold", plan[p.id] === "leave" && "text-muted")}>{ACTION_LABEL[plan[p.id]]}</span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-3 py-2.5">
                <span className="flex items-center gap-1.5">
                  <Icon.Shield width={18} height={18} className="text-accent" /> Protected · {protectedMsgs.length}
                </span>
                <span className="text-sm font-semibold text-accent">Untouched</span>
              </li>
            </ul>
          </Card>
          <Card>
            <p className="text-sm text-muted">Unread after this</p>
            <Meter before={inbox.length} after={summary.unreadAfter} />
            <p className="mt-2 text-sm">
              {summary.markRead} marked read · {summary.archive} archived · {summary.leave + summary.protectedCount} still unread, including all {summary.protectedCount} protected
            </p>
          </Card>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setStep("done")} disabled={summary.markRead + summary.archive === 0}>
              Confirm (simulated)
            </Button>
            <Button variant="ghost" onClick={() => setStep("piles")}>
              Change plan
            </Button>
          </div>
          <p className="text-[13px] text-muted">Demo only: confirming changes nothing in any mailbox.</p>
        </div>
      )}

      {step === "done" && (
        <Card className="mt-6 animate-rise">
          <p className="flex items-center gap-2 font-semibold text-accent">
            <Icon.Shield /> No real emails were changed
          </p>
          <p className="mt-2">
            In the full app, {summary.markRead} would be marked read and {summary.archive} archived (archived mail stays searchable and can be moved back).
            Your {summary.protectedCount} protected emails would be waiting, untouched.
          </p>
          <Meter before={inbox.length} after={summary.unreadAfter} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => setPreview("protected")}>Look at protected mail</Button>
            <Button
              variant="ghost"
              onClick={() => {
                rescuePlanStore.set(defaultPlan());
                setStep("start");
              }}
            >
              Start over
            </Button>
          </div>
        </Card>
      )}

      <PreviewSheet
        target={preview}
        onClose={() => setPreview(null)}
        protectedMsgs={protectedMsgs}
        pileMsgs={preview && preview !== "protected" ? piles[preview] : []}
        excludedFromPile={preview && preview !== "protected" ? protectedMsgs.filter((m) => PILES.find((p) => p.id === preview)!.kinds.includes(m.kind)).length : 0}
      />
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: [Step, string][] = [
    ["start", "Overview"],
    ["piles", "Sort piles"],
    ["review", "Review"],
    ["done", "Done"],
  ];
  const at = steps.findIndex(([s]) => s === step);
  return (
    <ol className="mt-5 flex gap-2" aria-label="Progress">
      {steps.map(([s, label], i) => (
        <li key={s} aria-current={i === at ? "step" : undefined} className="flex-1">
          <span className={cx("block h-1.5 rounded-full", i <= at ? "bg-accent" : "bg-surface-2")} />
          <span className={cx("mt-1 block text-xs", i === at ? "font-bold" : "text-muted")}>{label}</span>
        </li>
      ))}
    </ol>
  );
}

function ProtectedCard({ count, onOpen, compact }: { count: number; onOpen: () => void; compact?: boolean }) {
  return (
    <div className={cx("flex items-center gap-3 rounded-2xl border-[1.5px] border-accent bg-accent-soft p-4", compact && "py-3")}>
      <Icon.Shield className="flex-none text-accent" width={28} height={28} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{count} important emails are protected</p>
        {!compact && <p className="text-sm">Bills, appointments, security alerts, people you know and anything with a deadline are never included in bulk actions.</p>}
      </div>
      <Button size="sm" variant="ghost" onClick={onOpen}>
        See them
      </Button>
    </div>
  );
}

function Meter({ before, after }: { before: number; after: number }) {
  const pct = Math.round((after / before) * 100);
  return (
    <div className="mt-2">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-3xl font-semibold">{after}</span>
        <span className="text-muted">from {before}</span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-2" role="img" aria-label={`${after} of ${before} still unread`}>
        <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function BottomBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-[calc(92px+env(safe-area-inset-bottom,0px))] z-10 mt-5 flex items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3 text-bg lg:bottom-6">
      {children}
    </div>
  );
}

const PREVIEW_LIMIT = 25;

function PreviewSheet({
  target,
  onClose,
  protectedMsgs,
  pileMsgs,
  excludedFromPile,
}: {
  target: PileId | "protected" | null;
  onClose: () => void;
  protectedMsgs: RescueMessage[];
  pileMsgs: RescueMessage[];
  excludedFromPile: number;
}) {
  const isProtected = target === "protected";
  const msgs = isProtected ? protectedMsgs : pileMsgs;
  const pile = PILES.find((p) => p.id === target);
  const title = isProtected ? "Protected emails" : `${pile?.name ?? ""} preview`;

  return (
    <Sheet open={!!target} onClose={onClose} title={title}>
      <h3 className="pr-12 text-xl">{title}</h3>
      <p className="mt-1 text-sm text-muted">
        {isProtected
          ? "These stay unread and untouched. Handle them one by one when you're ready."
          : `${msgs.length} emails. Preview only: nothing changes until you confirm the plan.`}
      </p>
      {!isProtected && excludedFromPile > 0 && (
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-accent-soft p-3 text-sm">
          <Icon.Shield width={18} height={18} className="flex-none text-accent" /> {excludedFromPile} similar emails were kept out because they look important.
        </p>
      )}
      {!isProtected && (
        <>
          <h4 className="mt-4 text-[15px] font-bold">Senders</h4>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {senderCounts(msgs).map(([s, n]) => (
              <li key={s} className="rounded-full bg-surface-2 px-2.5 py-0.5 text-sm">
                {s} <span className="text-muted">{n}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      <h4 className="mt-4 text-[15px] font-bold">{isProtected ? "Emails" : "Most recent"}</h4>
      <ul className="mt-1 divide-y divide-line">
        {msgs.slice(0, PREVIEW_LIMIT).map((m) => (
          <li key={m.id} className="py-2.5">
            <p className="flex items-center gap-2 text-sm">
              <AccountDot account={m.account} />
              <b className="truncate font-semibold">{m.from}</b>
              <span className="ml-auto flex-none text-xs text-muted">{m.dayOffset === 0 ? "today" : `${-m.dayOffset}d ago`}</span>
            </p>
            <p className="truncate text-sm">{m.subject}</p>
            {isProtected && <p className="text-xs font-semibold text-accent">{protectReason(m)}</p>}
          </li>
        ))}
      </ul>
      {msgs.length > PREVIEW_LIMIT && <p className="mt-2 text-sm text-muted">and {msgs.length - PREVIEW_LIMIT} more</p>}
    </Sheet>
  );
}
