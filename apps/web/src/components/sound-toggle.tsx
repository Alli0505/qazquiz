"use client";

import { useEffect, useState } from "react";

import { useI18n } from "~/i18n";
import { sfx } from "~/lib/sfx";

export function SoundToggle() {
  const { m } = useI18n();
  const [muted, setMuted] = useState(false);
  // sync from persisted state after mount (avoids hydration mismatch)
  useEffect(() => setMuted(sfx.isMuted()), []);

  return (
    <button
      type="button"
      aria-label={muted ? m.common.unmute : m.common.mute}
      title={muted ? m.common.unmute : m.common.mute}
      onClick={() => {
        const next = sfx.toggleMuted();
        setMuted(next);
        if (!next) sfx.play("pop");
      }}
      className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-lg shadow-md backdrop-blur transition-transform hover:scale-110 dark:bg-zinc-800/70"
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
