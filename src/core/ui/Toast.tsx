"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type ToastAction = { label: string; onClick: () => void };
type Show = (message: string, action?: ToastAction) => void;

const ToastContext = createContext<Show>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; action?: ToastAction } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = useCallback<Show>((message, action) => {
    setToast({ message, action });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), action ? 5000 : 3200);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={
          "fixed left-1/2 z-50 flex w-max max-w-[min(92vw,440px)] -translate-x-1/2 items-center gap-3 rounded-2xl bg-ink py-2.5 pr-2.5 pl-4 text-sm text-bg shadow-lift transition-all duration-200 " +
          "bottom-[calc(96px+env(safe-area-inset-bottom,0px))] lg:bottom-8 " +
          (toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0")
        }
      >
        <span className="py-1">{toast?.message}</span>
        {toast?.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick();
              setToast(null);
            }}
            className="min-h-9 rounded-xl bg-bg/15 px-3 font-semibold text-bg hover:bg-bg/25"
          >
            {toast.action.label}
          </button>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
