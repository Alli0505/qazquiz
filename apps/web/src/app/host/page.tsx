"use client";

import { Button } from "@qazquiz/ui";
import { useState } from "react";

import { GameScreen } from "~/components/game-screen";
import { useGameSocket } from "~/lib/use-game";
import { useGameStore } from "~/store/game-store";

export default function HostPage() {
  const actions = useGameSocket();
  const gameCode = useGameStore((s) => s.gameCode);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  if (gameCode) return <GameScreen actions={actions} />;

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-center text-3xl font-black">Host a quiz</h1>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          setBusy(true);
          await actions.host(name.trim());
        }}
      >
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={24}
          className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-3 outline-none focus:border-indigo-500 dark:border-zinc-700"
        />
        <Button type="submit" className="w-full" disabled={busy || !name.trim()}>
          {busy ? "Creating…" : "Create room"}
        </Button>
      </form>
      <p className="text-center text-sm text-zinc-500">
        You'll get a 5-letter code to share. Demo quiz is preloaded.
      </p>
    </main>
  );
}
