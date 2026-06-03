import { Button } from "@qazquiz/ui";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="space-y-3">
        <h1 className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-6xl font-black tracking-tight text-transparent">
          QazQuiz
        </h1>
        <p className="text-lg text-zinc-500">
          Real-time multiplayer quiz battles. Create a room, share the code,
          play live.
        </p>
      </div>

      <div className="flex gap-3">
        <Link href="/play">
          <Button>Join a game</Button>
        </Link>
        <Link href="/host">
          <Button variant="secondary">Host a quiz</Button>
        </Link>
      </div>

      <Link
        href="/leaderboard"
        className="text-sm text-indigo-500 underline-offset-4 hover:underline"
      >
        View global leaderboard →
      </Link>
    </main>
  );
}
