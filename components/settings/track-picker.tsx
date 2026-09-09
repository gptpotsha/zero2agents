"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { selectTrackAction } from "@/app/actions/track";
import type { TrackManifest } from "@/lib/content/types";

/** Выбор агентского трека (карточки с манифестами). */
export function TrackPicker({
  tracks,
  currentTrackId,
}: {
  tracks: TrackManifest[];
  currentTrackId: string | null;
}) {
  const [selected, setSelected] = useState<string | null>(currentTrackId);
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const save = () => {
    if (!selected) return;
    startTransition(async () => {
      await selectTrackAction(selected);
      setDone(true);
    });
  };

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {tracks.map((track) => {
          const isSelected = selected === track.id;
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => setSelected(track.id)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                isSelected ? "border-primary bg-primary/5" : "hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg font-mono text-sm font-bold text-white"
                  style={{ background: track.accent }}
                  aria-hidden="true"
                >
                  &gt;_
                </span>
                <div>
                  <p className="font-semibold">{track.name}</p>
                  <p className="text-xs text-muted-foreground">{track.tagline}</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1">
                {track.capabilities.slice(0, 3).map((cap) => (
                  <li key={cap} className="text-xs text-muted-foreground">
                    · {cap}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={save} disabled={!selected || pending}>
          {pending ? "Сохраняю…" : "Выбрать агента"}
        </Button>
        {done && <span className="text-sm text-green-600 dark:text-green-400">Сохранено!</span>}
      </div>
    </div>
  );
}
