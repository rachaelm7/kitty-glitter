import { Tag, cx } from "@/core/ui/primitives";
import { relativeDay } from "@/core/date";
import type { Message } from "../data/types";
import { AccountDot } from "./AccountDot";
import { CATEGORY_LABEL } from "./labels";

export function MessageRow({ message: m, now, onOpen }: { message: Message; now: Date; onOpen: () => void }) {
  const when = m.receivedDayOffset === 0 ? m.time : relativeDay(m.receivedDayOffset, now);
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cx(
        "block w-full border-b border-line px-1 py-3.5 text-left transition-colors last:border-b-0 hover:bg-surface-2/60",
        m.urgent && "border-l-4 border-l-urgent pl-3",
      )}
    >
      <span className="flex items-center gap-2 text-sm">
        <AccountDot account={m.account} />
        <span className={cx("truncate", m.unread ? "font-bold" : "font-medium")}>{m.from}</span>
        <span className="ml-auto flex-none text-[13px] text-muted">{when}</span>
      </span>
      <span className={cx("mt-0.5 block font-semibold", m.urgent && "text-urgent")}>{m.subject}</span>
      <span className="block truncate text-sm text-muted">{m.preview}</span>
      <span className="mt-1.5 flex flex-wrap gap-1.5">
        <Tag tone="neutral">{CATEGORY_LABEL[m.category]}</Tag>
        {m.urgent && <Tag tone="urgent">Needs you</Tag>}
        {!m.urgent && m.needsAction && <Tag>Action</Tag>}
      </span>
    </button>
  );
}
