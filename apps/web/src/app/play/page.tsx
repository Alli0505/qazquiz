"use client";

import { Button } from "@qazquiz/ui";
import { useState } from "react";

import { GameScreen } from "~/components/game-screen";
import { useGameSocket } from "~/lib/use-game";
import { useGameStore } from "~/store/game-store";

export default function PlayPage() {
  const actions = useGameSocket();
  const gameCode = useGameStore((s) => s.gameCode);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (gameCode) return <GameScreen actions={actions} />;

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-center text-3xl font-black">Join a game</h1>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!code.trim() || !name.trim()) return;
          setBusy(true);
          setError(null);
          const res = await actions.join(code.trim(), name.trim());
          setBusy(false);
          if (!res.ok) setError(res.error ?? "Could not join");
        }}
      >
        <input
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Game code"
          maxLength={5}
          className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-3 text-center font-mono text-2xl tracking-[0.3em] outline-none focus:border-indigo-500 dark:border-zinc-700"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={24}
          className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-3 outline-none focus:border-indigo-500 dark:border-zinc-700"
        />
        {error && <p className="text-center text-sm text-rose-500">{error}</p>}
        <Button
          type="submit"
          className="w-full"
          disabled={busy || !code.trim() || !name.trim()}
        >
          {busy ? "Joining…" : "Join"}
        </Button>
      </form>
    </main>
  );
}
