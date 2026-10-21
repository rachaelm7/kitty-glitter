"use client";

import { useEffect, useState } from "react";
import { Sheet } from "@/core/ui/Sheet";
import { Button, cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { SAMPLE_TRANSCRIPTS } from "../data/samples";

/**
 * Simulated voice capture. It never touches the microphone: it "transcribes"
 * one of a few fictional voice notes word by word.
 */
export function VoiceSheet({ open, onClose, onUse }: { open: boolean; onClose: () => void; onUse: (text: string) => void }) {
  const [pick, setPick] = useState(0);
  const [shown, setShown] = useState(0);
  const [running, setRunning] = useState(false);
  const words = SAMPLE_TRANSCRIPTS[pick].text.split(" ");
  const finished = shown >= words.length;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setShown((n) => {
        if (n + 1 >= words.length) {
          clearInterval(id);
          setRunning(false);
        }
        return n + 1;
      });
    }, 70);
    return () => clearInterval(id);
  }, [running, words.length]);

  function start() {
    // With reduced motion, show the whole transcript at once.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setShown(words.length);
    else setRunning(true);
  }

  function close() {
    setRunning(false);
    setShown(0);
    onClose();
  }

  return (
    <Sheet open={open} onClose={close} title="Simulated voice note">
      <h3 className="pr-12 text-xl">Voice note</h3>
      <p className="mt-1 text-sm text-muted">Simulated: your microphone is not used. Pick a sample recording to transcribe.</p>

      <div role="radiogroup" aria-label="Sample recording" className="mt-4 flex flex-wrap gap-2">
        {SAMPLE_TRANSCRIPTS.map((s, i) => (
          <button
            key={s.label}
            type="button"
            role="radio"
            aria-checked={pick === i}
            disabled={running}
            onClick={() => {
              setPick(i);
              setShown(0);
            }}
            className={cx(
              "min-h-10 rounded-full border-[1.5px] px-3.5 text-sm font-semibold",
              pick === i ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-4">
        <span
          aria-hidden
          className={cx(
            "grid size-16 flex-none place-items-center rounded-full bg-accent text-accent-ink",
            running && "motion-safe:animate-pulse",
          )}
        >
          <Icon.Mic width={28} height={28} />
        </span>
        <p className="text-sm text-muted" aria-live="polite">
          {running ? "Transcribing…" : finished ? "Transcript ready" : "Ready"}
        </p>
      </div>

      <p className="mt-4 min-h-24 rounded-2xl bg-bg p-4 leading-relaxed" data-testid="voice-transcript">
        {shown === 0 ? <span className="text-muted">The transcript appears here.</span> : words.slice(0, shown).join(" ")}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {!finished ? (
          <Button onClick={start} disabled={running}>
            {running ? "Listening (simulated)…" : "Start simulated recording"}
          </Button>
        ) : (
          <Button
            onClick={() => {
              onUse(words.join(" "));
              close();
            }}
          >
            Use transcript
          </Button>
        )}
        <Button variant="ghost" onClick={close}>
          Cancel
        </Button>
      </div>
    </Sheet>
  );
}
