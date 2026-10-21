"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./icons";

/**
 * Bottom sheet on phones, centered panel on desktop. Built on <dialog>, so
 * focus is trapped, Escape closes it and the page behind is inert.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="kg-sheet m-0 mt-auto max-h-[90dvh] w-full max-w-none overflow-y-auto rounded-t-3xl bg-surface p-0 text-ink backdrop:bg-scrim sm:m-auto sm:max-w-xl sm:rounded-3xl"
    >
      {open && (
        <div className="px-5 pt-5 pb-[calc(24px+env(safe-area-inset-bottom,0px))] sm:px-6 sm:pb-6">
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line sm:hidden" aria-hidden />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="float-right grid size-10 place-items-center rounded-full bg-surface-2 text-ink"
          >
            <Icon.Close width={20} height={20} />
          </button>
          {children}
        </div>
      )}
    </dialog>
  );
}
