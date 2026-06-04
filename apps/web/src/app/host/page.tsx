"use client";

import { Button } from "@qazquiz/ui";
import type { Difficulty } from "@qazquiz/types";
import { useState } from "react";

import { GameScreen } from "~/components/game-screen";
import { useI18n } from "~/i18n";
import { useGameSocket } from "~/lib/use-game";
import { useGameStore } from "~/store/game-store";

export default function HostPage() {
  const { m } = useI18n();
  const actions = useGameSocket();
  const gameCode = useGameStore((s) => s.gameCode);
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [busy, setBusy] = useState(false);

  if (gameCode) return <GameScreen actions={actions} />;

  const difficultyHint =
    difficulty === "hard" ? m.host.hardHint : m.host.easyHint;

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-center text-3xl font-black">{m.host.title}</h1>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          setBusy(true);
          await actions.host(name.trim(), difficulty);
        }}
      >
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={m.host.namePlaceholder}
          maxLength={24}
          className="w-full rounded-xl border border-zinc-300 bg-white/60 px-4 py-3 outline-none backdrop-blur-sm focus:border-indigo-500 dark:border-zinc-700 dark:bg-black/30"
        />

        {/* difficulty selector */}
        <div>
          <p className="mb-2 text-center text-sm font-semibold text-zinc-700 [text-shadow:0_1px_8px_rgba(255,255,255,0.6)] dark:text-zinc-200 dark:[text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
            {m.host.difficulty}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(["easy", "hard"] as const).map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={difficulty === d}
                onClick={() => setDifficulty(d)}
                className={[
                  "rounded-xl px-4 py-3 text-sm font-bold transition-colors",
                  difficulty === d
                    ? d === "hard"
                      ? "bg-rose-600 text-white"
                      : "bg-indigo-600 text-white"
                    : "bg-white/60 text-zinc-700 backdrop-blur-sm hover:bg-white/80 dark:bg-black/30 dark:text-zinc-200",
                ].join(" ")}
              >
                {d === "hard" ? m.host.hard : m.host.easy}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={busy || !name.trim()}>
          {busy ? m.host.creating : m.host.create}
        </Button>
      </form>
      <p className="text-center text-sm font-medium text-zinc-700 [text-shadow:0_1px_8px_rgba(255,255,255,0.6)] dark:text-zinc-200 dark:[text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
        {difficultyHint}
      </p>
    </main>
  );
}
