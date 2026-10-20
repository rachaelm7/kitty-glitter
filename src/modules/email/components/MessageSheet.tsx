"use client";

import { Sheet } from "@/core/ui/Sheet";
import { Button, Tag } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { useToast } from "@/core/ui/Toast";
import { useStore } from "@/core/store/createStore";
import { mockEmailProvider } from "../data/mock";
import { draftStore } from "../data/store";
import type { Message } from "../data/types";
import { AccountDot } from "./AccountDot";
import { CATEGORY_LABEL } from "./labels";

export function MessageSheet({ message, onClose }: { message: Message | null; onClose: () => void }) {
  return (
    <Sheet open={!!message} onClose={onClose} title={message?.subject ?? "Message"}>
      {message && <MessageDetail m={message} />}
    </Sheet>
  );
}

function MessageDetail({ m }: { m: Message }) {
  const drafts = useStore(draftStore);
  const toast = useToast();
  const account = mockEmailProvider.listAccounts().find((a) => a.id === m.account);
  const draft = drafts[m.id] ?? m.suggestedReply ?? "";

  return (
    <div>
      <p className="mb-1.5 flex items-center gap-2 text-sm">
        <AccountDot account={m.account} />
        <b className="font-semibold">{m.from}</b>
        <span className="text-muted">to {account?.name}</span>
      </p>
      <h3 className="pr-12 text-xl leading-snug">{m.subject}</h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Tag tone="neutral">{CATEGORY_LABEL[m.category]}</Tag>
        {m.urgent && <Tag tone="urgent">Needs you</Tag>}
      </div>

      <div className="mt-5 rounded-2xl bg-accent-soft p-4">
        <p className="flex items-center gap-1.5 text-sm font-bold text-accent">
          <Icon.Sparkle width={16} height={16} /> Summary
        </p>
        <p className="mt-1">{m.summary}</p>
        <p className="mt-2 text-xs text-muted">Simulated AI summary for the demo.</p>
      </div>

      <h4 className="mt-5 text-[15px] font-bold">Deadline found</h4>
      {m.deadline ? (
        <p className="font-semibold text-urgent">{m.deadline.label}</p>
      ) : (
        <p className="text-muted">No deadline in this email.</p>
      )}

      <h4 className="mt-5 text-[15px] font-bold">Suggested reply</h4>
      {m.suggestedReply ? (
        <>
          <label htmlFor={`draft-${m.id}`} className="sr-only">
            Suggested reply (editable)
          </label>
          <textarea
            id={`draft-${m.id}`}
            value={draft}
            onChange={(e) => draftStore.set((d) => ({ ...d, [m.id]: e.target.value }))}
            className="mt-1 min-h-28 w-full resize-y rounded-2xl border-[1.5px] border-line bg-bg p-3"
          />
          <div className="mt-2.5 flex flex-wrap gap-2">
            <Button
              onClick={() => {
                navigator.clipboard?.writeText(draft).then(
                  () => toast("Reply copied"),
                  () => toast("Select the text to copy it"),
                );
              }}
            >
              Copy reply
            </Button>
            <Button variant="ghost" disabled aria-describedby={`send-note-${m.id}`}>
              Send
            </Button>
          </div>
          <p id={`send-note-${m.id}`} className="mt-2 text-[13px] text-muted">
            Drafts only. Sending is switched off; nothing leaves without your approval.
          </p>
        </>
      ) : (
        <p className="text-muted">No reply needed.</p>
      )}
    </div>
  );
}
