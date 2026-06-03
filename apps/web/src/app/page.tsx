"use client";

import { Button } from "@qazquiz/ui";
import Link from "next/link";

import { useI18n } from "~/i18n";

export default function HomePage() {
  const { m } = useI18n();
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="space-y-3">
        <h1 className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-6xl font-black tracking-tight text-transparent">
          QazQuiz
        </h1>
        <p className="text-lg font-medium text-zinc-700 [text-shadow:0_1px_8px_rgba(255,255,255,0.6)] dark:text-zinc-100 dark:[text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
          {m.home.subtitle}
        </p>
      </div>

      <div className="flex gap-3">
        <Link href="/play">
          <Button>{m.home.join}</Button>
        </Link>
        <Link href="/host">
          <Button variant="secondary">{m.home.host}</Button>
        </Link>
      </div>

      <Link
        href="/leaderboard"
        className="rounded-full bg-white/60 px-4 py-1.5 text-sm font-semibold text-indigo-700 underline-offset-4 backdrop-blur-sm hover:underline dark:bg-black/40 dark:text-indigo-200"
      >
        {m.home.leaderboard}
      </Link>
    </main>
  );
}
