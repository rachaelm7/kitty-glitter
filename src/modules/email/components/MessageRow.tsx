import { Tag, cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { SwipeRow } from "@/core/ui/SwipeRow";
import { relativeDay } from "@/core/date";
import type { Message } from "../data/types";
import { AccountDot } from "./AccountDot";
import { CATEGORY_LABEL } from "./labels";

export function MessageRow({
  message: m,
  unread,
  now,
  onOpen,
  onArchive,
  onToggleRead,
  archived,
  focused,
}: {
  message: Message;
  unread: boolean;
  now: Date;
  onOpen: () => void;
  onArchive: () => void;
  onToggleRead?: () => void;
  archived?: boolean;
  focused?: boolean;
}) {
  const when = m.receivedDayOffset === 0 ? m.time : relativeDay(m.receivedDayOffset, now);
  return (
    <li
      data-message-id={m.id}
      aria-current={focused ? "true" : undefined}
      className={cx(
        "group relative border-b border-line last:border-b-0",
        focused && "bg-accent-soft/40 ring-2 ring-accent ring-inset",
      )}
    >
      <SwipeRow
        onSwipeStart={onToggleRead}
        onSwipeEnd={onArchive}
        startLabel={unread ? "Read" : "Unread"}
        endLabel={archived ? "Move back" : "Archive"}
        startIcon={unread ? <Icon.MailOpen width={18} height={18} /> : <Icon.Mail width={18} height={18} />}
        endIcon={archived ? <Icon.Undo width={18} height={18} /> : <Icon.Archive width={18} height={18} />}
      >
      <div className={cx("relative flex items-stretch", m.urgent && "before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-full before:bg-urgent")}>
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 py-3.5 pr-1 pl-3 text-left transition-colors hover:bg-surface-2/50">
        <span className="flex items-center gap-2 text-sm">
          <span aria-hidden className={cx("size-2 flex-none rounded-full", unread && "bg-ink")} />
          {unread && <span className="sr-only">Unread: </span>}
          <AccountDot account={m.account} />
          <span className={cx("truncate", unread ? "font-bold" : "font-medium text-muted")}>{m.from}</span>
          <span className="ml-auto flex-none text-[13px] text-muted">{when}</span>
        </span>
        <span className={cx("mt-0.5 block pl-4", unread ? "font-semibold" : "font-normal", m.urgent && "text-urgent")}>{m.subject}</span>
        <span className="block truncate pl-4 text-sm text-muted">{m.preview}</span>
        <span className="mt-1.5 flex flex-wrap gap-1.5 pl-4">
          <Tag tone="neutral">{CATEGORY_LABEL[m.category]}</Tag>
          {m.urgent && <Tag tone="urgent">Needs you</Tag>}
          {!m.urgent && m.needsAction && <Tag>Action</Tag>}
          {m.deadline && <Tag tone="champagne">{m.deadline.label}</Tag>}
        </span>
      </button>
      <button
        type="button"
        onClick={onArchive}
        aria-label={`${archived ? "Move back to inbox" : "Archive"}: ${m.subject}`}
        className="my-auto mr-1 grid size-10 flex-none place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"
      >
        {archived ? <Icon.Undo width={18} height={18} /> : <Icon.Archive width={18} height={18} />}
      </button>
      </div>
      </SwipeRow>
    </li>
  );
}
