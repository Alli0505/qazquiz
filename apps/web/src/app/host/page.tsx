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
  const [error, setError] = useState<string | null>(null);

  if (gameCode) return <GameScreen actions={actions} />;

  const difficultyHint = {
    easy: m.host.easyHint,
    medium: m.host.mediumHint,
    hard: m.host.hardHint,
  }[difficulty];

  const difficultyLabel: Record<Difficulty, string> = {
    easy: m.host.easy,
    medium: m.host.medium,
    hard: m.host.hard,
  };

  const activeClass: Record<Difficulty, string> = {
    easy: "bg-indigo-600 text-white hover:bg-indigo-500",
    medium: "bg-amber-500 text-white hover:bg-amber-400",
    hard: "bg-rose-600 text-white hover:bg-rose-500",
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-center text-3xl font-black">{m.host.title}</h1>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          setBusy(true);
          setError(null);
          const code = await actions.host(name.trim(), difficulty);
          setBusy(false);
          if (!code) setError(m.host.error);
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
          <div className="grid grid-cols-3 gap-2">
            {(["easy", "medium", "hard"] as const).map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={difficulty === d}
                onClick={() => setDifficulty(d)}
                className={[
                  "rounded-xl px-3 py-3 text-sm font-bold transition-colors",
                  difficulty === d
                    ? activeClass[d]
                    : "bg-white/80 text-zinc-800 backdrop-blur-sm hover:bg-white dark:bg-zinc-800/80 dark:text-zinc-100 dark:hover:bg-zinc-700",
                ].join(" ")}
              >
                {difficultyLabel[d]}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={busy || !name.trim()}>
          {busy ? m.host.creating : m.host.create}
        </Button>
        {error && (
          <p className="text-center text-sm font-semibold text-rose-500">
            {error}
          </p>
        )}
      </form>
      <p className="text-center text-sm font-medium text-zinc-700 [text-shadow:0_1px_8px_rgba(255,255,255,0.6)] dark:text-zinc-200 dark:[text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
        {difficultyHint}
      </p>
    </main>
  );
}
