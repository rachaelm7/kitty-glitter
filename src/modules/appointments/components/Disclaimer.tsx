import { Icon } from "@/core/ui/icons";

export function NotMedicalAdvice({ compact }: { compact?: boolean }) {
  return (
    <div role="note" className={compact ? "text-[13px] text-muted" : "flex gap-3 rounded-[22px] border border-line/70 bg-surface shadow-soft p-4"}>
      {!compact && <Icon.Shield className="flex-none text-accent" />}
      <p className={compact ? "" : "text-sm"}>
        <b className="font-semibold">Fictional demo. Not medical advice.</b> These providers and appointments are made up. Suggestions here are only about
        scheduling and paperwork; always follow your own care team&apos;s instructions.
      </p>
    </div>
  );
}
