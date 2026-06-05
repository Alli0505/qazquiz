"use client";

import { Button } from "@qazquiz/ui";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { useI18n } from "~/i18n";
import { sfx } from "~/lib/sfx";
import { useGameSocket } from "~/lib/use-game";
import { useGameStore } from "~/store/game-store";

const CHOICE_STYLES = [
  "bg-rose-500 hover:bg-rose-400",
  "bg-sky-500 hover:bg-sky-400",
  "bg-amber-500 hover:bg-amber-400",
  "bg-emerald-500 hover:bg-emerald-400",
];
const CHOICE_SHAPES = ["▲", "◆", "●", "■"];

export function GameScreen({ actions }: { actions: ReturnType<typeof useGameSocket> }) {
  const phase = useGameStore((s) => s.phase);

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center px-6 py-10">
      <AnimatePresence mode="wait">
        {phase === "LOBBY" && <Lobby key="lobby" actions={actions} />}
        {phase === "STARTING" && <Starting key="starting" />}
        {phase === "QUESTION_ACTIVE" && <QuestionView key="q" actions={actions} />}
        {phase === "ANSWER_REVEAL" && <RevealView key="reveal" />}
        {phase === "GAME_OVER" && <GameOverView key="over" />}
      </AnimatePresence>
    </main>
  );
}

function Fade({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

function Lobby({ actions }: { actions: ReturnType<typeof useGameSocket> }) {
  const { gameCode, players, isHost } = useGameStore();
  const { m, t } = useI18n();
  return (
    <Fade>
      <div className="space-y-8 text-center">
        <div>
          <p className="text-sm uppercase tracking-widest text-soft">
            {m.lobby.joinCode}
          </p>
          <p className="font-mono text-6xl font-black tracking-[0.2em] text-indigo-500">
            {gameCode}
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm text-soft">
            {t(
              players.length === 1
                ? m.lobby.players_one
                : m.lobby.players_other,
              { n: players.length },
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {players.map((p) => (
              <motion.span
                key={p.id}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-full bg-zinc-200 px-4 py-1.5 text-sm font-semibold dark:bg-zinc-800"
              >
                {p.name}
              </motion.span>
            ))}
          </div>
        </div>

        {isHost ? (
          <Button onClick={actions.start} disabled={players.length === 0}>
            {m.lobby.start}
          </Button>
        ) : (
          <p className="animate-pulse text-soft">{m.lobby.waiting}</p>
        )}
      </div>
    </Fade>
  );
}

function Starting() {
  const { m } = useI18n();
  const [n, setN] = useState(3);
  useEffect(() => {
    sfx.play("tick");
    const id = setInterval(
      () =>
        setN((v) => {
          const next = Math.max(0, v - 1);
          sfx.play(next === 0 ? "reveal" : "tick");
          return next;
        }),
      1000,
    );
    return () => clearInterval(id);
  }, []);
  return (
    <Fade>
      <div className="text-center">
        <motion.p
          key={n}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-8xl font-black text-indigo-500"
        >
          {n === 0 ? m.lobby.go : n}
        </motion.p>
      </div>
    </Fade>
  );
}

function useCountdown(endsAt: number | null) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!endsAt) return;
    const tick = () => setRemaining(Math.max(0, endsAt - Date.now()));
    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [endsAt]);
  return remaining;
}

function QuestionView({ actions }: { actions: ReturnType<typeof useGameSocket> }) {
  const { question, questionIndex, questionTotal, endsAt, selectedChoice } =
    useGameStore();
  const { m, t, lx } = useI18n();
  const remaining = useCountdown(endsAt);
  if (!question) return null;
  const secs = Math.ceil(remaining / 1000);
  const locked = selectedChoice !== null;

  return (
    <Fade>
      <div className="space-y-6">
        <div className="flex items-center justify-between text-sm text-soft">
          <span>
            {t(m.game.question, {
              index: questionIndex + 1,
              total: questionTotal,
            })}
          </span>
          <span className="font-mono text-2xl font-bold text-indigo-500">
            {secs}s
          </span>
        </div>

        <h2 className="text-center text-3xl font-bold">
          {lx(question.prompt)}
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {question.choices.map((choice, i) => (
            <button
              key={i}
              disabled={locked}
              onClick={() => actions.answer(question.id, i)}
              className={[
                "flex items-center gap-3 rounded-2xl px-5 py-6 text-left text-lg font-semibold text-white transition-all",
                CHOICE_STYLES[i],
                locked && selectedChoice !== i ? "opacity-40" : "",
                locked && selectedChoice === i ? "ring-4 ring-white" : "",
              ].join(" ")}
            >
              <span className="text-2xl">{CHOICE_SHAPES[i]}</span>
              {lx(choice)}
            </button>
          ))}
        </div>

        {locked && (
          <p className="text-center text-soft">{m.game.locked}</p>
        )}
      </div>
    </Fade>
  );
}

function RevealView() {
  const { leaderboard, correctIndex, question, myId } = useGameStore();
  const { m, lx } = useI18n();
  const correctChoice =
    question && correctIndex !== null ? question.choices[correctIndex] : null;
  return (
    <Fade>
      <div className="space-y-6 text-center">
        {correctChoice && (
          <div className="rounded-2xl bg-emerald-500/15 p-4">
            <p className="text-sm text-soft">{m.reveal.correct}</p>
            <p className="text-xl font-bold text-emerald-500">
              {lx(correctChoice)}
            </p>
          </div>
        )}
        <Leaderboard
          myId={myId}
          entries={leaderboard}
          title={m.reveal.standings}
        />
      </div>
    </Fade>
  );
}

function GameOverView() {
  const { leaderboard, myId } = useGameStore();
  const { m, t } = useI18n();
  const me = leaderboard.find((e) => e.playerId === myId);
  return (
    <Fade>
      <div className="space-y-8 text-center">
        <div>
          <p className="text-sm uppercase tracking-widest text-soft">
            {m.over.label}
          </p>
          <h2 className="text-4xl font-black">{m.over.title}</h2>
          {me && (
            <p className="mt-2 text-soft">
              {t(m.over.you, { rank: me.rank, score: me.score })}
            </p>
          )}
        </div>
        <Leaderboard myId={myId} entries={leaderboard} title="" />
      </div>
    </Fade>
  );
}

function Leaderboard({
  entries,
  myId,
  title,
}: {
  entries: ReturnType<typeof useGameStore.getState>["leaderboard"];
  myId: string | null;
  title: string;
}) {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div className="mx-auto max-w-md space-y-2">
      {title && (
        <p className="text-sm uppercase tracking-widest text-soft">
          {title}
        </p>
      )}
      {entries.map((e, i) => (
        <motion.div
          key={e.playerId}
          layout
          className={[
            "flex items-center justify-between rounded-xl px-4 py-3 text-left",
            e.playerId === myId
              ? "bg-indigo-500/20 ring-2 ring-indigo-500"
              : "bg-zinc-100 dark:bg-zinc-800",
          ].join(" ")}
        >
          <span className="font-semibold">
            {medals[i] ?? `#${e.rank}`} {e.name}
          </span>
          <span className="font-mono font-bold">{e.score}</span>
        </motion.div>
      ))}
    </div>
  );
}
