"use client";

import Link from "next/link";
import { Sheet } from "@/core/ui/Sheet";
import { Button, Tag } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { useToast } from "@/core/ui/Toast";
import { useStore } from "@/core/store/createStore";
import { mockEmailProvider } from "../data/mock";
import { draftStore, markRead, setArchived } from "../data/store";
import type { Message } from "../data/types";
import { AccountDot } from "./AccountDot";
import { CATEGORY_LABEL } from "./labels";

export function MessageSheet({
  message,
  unread,
  archived,
  onClose,
  onMakeTask,
}: {
  message: Message | null;
  unread: boolean;
  archived: boolean;
  onClose: () => void;
  onMakeTask?: (m: Message) => void;
}) {
  return (
    <Sheet open={!!message} onClose={onClose} title={message?.subject ?? "Message"}>
      {message && <MessageDetail m={message} unread={unread} archived={archived} onClose={onClose} onMakeTask={onMakeTask} />}
    </Sheet>
  );
}

function MessageDetail({
  m,
  unread,
  archived,
  onClose,
  onMakeTask,
}: {
  m: Message;
  unread: boolean;
  archived: boolean;
  onClose: () => void;
  onMakeTask?: (m: Message) => void;
}) {
  const drafts = useStore(draftStore);
  const toast = useToast();
  const account = mockEmailProvider.listAccounts().find((a) => a.id === m.account);
  const draft = drafts[m.id] ?? m.suggestedReply ?? "";

  return (
    <div>
      <p className="mb-1.5 flex flex-wrap items-center gap-x-2 text-sm">
        <AccountDot account={m.account} />
        <b className="font-semibold">{m.from}</b>
        <span className="text-muted">
          {m.fromAddress} → {account?.name}
        </span>
      </p>
      <h3 className="pr-12 text-xl leading-snug">{m.subject}</h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Tag tone="neutral">{CATEGORY_LABEL[m.category]}</Tag>
        {m.urgent && <Tag tone="urgent">Needs you</Tag>}
        {archived && <Tag tone="lavender">Archived (demo)</Tag>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            markRead(m.id, unread);
            toast(unread ? "Marked as read" : "Marked as unread");
          }}
        >
          {unread ? <Icon.MailOpen width={16} height={16} /> : <Icon.Mail width={16} height={16} />} {unread ? "Mark read" : "Mark unread"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setArchived(m.id, !archived);
            onClose();
            toast(archived ? "Moved back to inbox" : "Archived (demo only)", { label: "Undo", onClick: () => setArchived(m.id, archived) });
          }}
        >
          {archived ? <Icon.Undo width={16} height={16} /> : <Icon.Archive width={16} height={16} />} {archived ? "Move to inbox" : "Archive"}
        </Button>
        {onMakeTask && m.needsAction && (
          <Button size="sm" variant="ghost" onClick={() => onMakeTask(m)}>
            <Icon.Tasks width={16} height={16} /> Make a task
          </Button>
        )}
      </div>

      <div className="mt-5 rounded-2xl bg-accent-soft p-4">
        <p className="flex items-center gap-1.5 text-sm font-bold text-accent">
          <Icon.Sparkle width={16} height={16} /> Summary
        </p>
        <p className="mt-1">{m.summary}</p>
        <p className="mt-2 text-xs text-muted">
          Sorted as <b className="font-semibold">{CATEGORY_LABEL[m.category]}</b> because: {m.why.charAt(0).toLowerCase() + m.why.slice(1)}. Simulated AI.
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-surface-2 p-3.5">
          <p className="text-xs font-bold tracking-wide text-muted uppercase">Deadline found</p>
          {m.deadline ? <p className="font-semibold text-urgent">{m.deadline.label}</p> : <p className="text-muted">None in this email</p>}
        </div>
        <div className="rounded-2xl bg-surface-2 p-3.5">
          <p className="text-xs font-bold tracking-wide text-muted uppercase">Life Thread</p>
          {m.threadId ? (
            <Link href={`/threads/${m.threadId}`} className="font-semibold text-accent underline-offset-2 hover:underline">
              Open the thread
            </Link>
          ) : (
            <p className="text-muted">Not part of a thread</p>
          )}
        </div>
      </div>

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
            Drafts only. Sending is switched off in this demo; nothing ever leaves without your approval.
          </p>
        </>
      ) : (
        <p className="text-muted">No reply needed.</p>
      )}
    </div>
  );
}
