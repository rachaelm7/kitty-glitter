"use client";

import Link from "next/link";
import { useStore } from "@/core/store/createStore";
import { Icon } from "@/core/ui/icons";
import { threadStore } from "../data/store";

export function ThreadTag({ id, link = true }: { id: string; link?: boolean }) {
  const thread = useStore(threadStore).find((t) => t.id === id);
  if (!thread) return null;
  const body = (
    <>
      <Icon.Thread width={13} height={13} style={{ color: thread.color }} />
      {thread.name}
    </>
  );
  const cls = "inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs font-semibold";
  return link ? (
    <Link href={`/threads#${thread.id}`} className={cls + " hover:bg-surface-2"}>
      {body}
    </Link>
  ) : (
    <span className={cls}>{body}</span>
  );
}
