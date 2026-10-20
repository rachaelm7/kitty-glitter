"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

const ToastContext = createContext<(message: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = useCallback((m: string) => {
    setMessage(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 3200);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={
          "pointer-events-none fixed left-1/2 z-50 w-max max-w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl bg-ink px-4 py-3 text-sm text-bg transition-all duration-200 " +
          "bottom-[calc(96px+env(safe-area-inset-bottom,0px))] lg:bottom-8 " +
          (message ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")
        }
      >
        {message}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
