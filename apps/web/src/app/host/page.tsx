"use client";

import { Button } from "@qazquiz/ui";
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
  const [busy, setBusy] = useState(false);

  if (gameCode) return <GameScreen actions={actions} />;

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-center text-3xl font-black">{m.host.title}</h1>
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
          placeholder={m.host.namePlaceholder}
          maxLength={24}
          className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-3 outline-none focus:border-indigo-500 dark:border-zinc-700"
        />
        <Button type="submit" className="w-full" disabled={busy || !name.trim()}>
          {busy ? m.host.creating : m.host.create}
        </Button>
      </form>
      <p className="text-center text-sm text-zinc-500">{m.host.hint}</p>
    </main>
  );
}
