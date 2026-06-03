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
        <p className="text-lg text-zinc-500">{m.home.subtitle}</p>
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
        className="text-sm text-indigo-500 underline-offset-4 hover:underline"
      >
        {m.home.leaderboard}
      </Link>
    </main>
  );
}
