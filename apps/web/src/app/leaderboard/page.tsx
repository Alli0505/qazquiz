import { Button } from "@qazquiz/ui";
import Link from "next/link";

export default function LeaderboardPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-black">Global leaderboard</h1>
      <p className="text-zinc-500">
        All-time rankings persist to Postgres once a database is connected.
        For the MVP, live in-game standings appear at the end of each match.
      </p>
      <Link href="/">
        <Button variant="secondary">Back home</Button>
      </Link>
    </main>
  );
}
