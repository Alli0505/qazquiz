"use client";

import { Button } from "@qazquiz/ui";
import Link from "next/link";

import { useI18n } from "~/i18n";

export default function LeaderboardPage() {
  const { m } = useI18n();
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-black">{m.leaderboard.title}</h1>
      <p className="text-soft">{m.leaderboard.desc}</p>
      <Link href="/">
        <Button variant="secondary">{m.leaderboard.back}</Button>
      </Link>
    </main>
  );
}
