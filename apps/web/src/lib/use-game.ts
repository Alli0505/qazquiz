"use client";

import { useCallback, useEffect, useRef } from "react";

import { getSocket } from "./socket";
import { sfx } from "./sfx";
import { useGameStore } from "~/store/game-store";

/**
 * Connects the shared socket, wires every ServerToClientEvent into the
 * Zustand store, and returns the client-side actions. Mount once per
 * game screen (host or play).
 */
export function useGameSocket() {
  const store = useGameStore();
  const prevPlayerCount = useRef(0);

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const onLobby = (p: {
      players: Parameters<typeof store.setLobby>[0];
      hostId: string;
    }) => {
      // pop only when someone new arrives, not on every lobby refresh
      if (p.players.length > prevPlayerCount.current) sfx.play("pop");
      prevPlayerCount.current = p.players.length;
      useGameStore.getState().setLobby(p.players, p.hostId);
    };
    const onStarting = () => {
      sfx.play("start");
      useGameStore.getState().setPhase("STARTING");
    };
    const onQuestion = (p: {
      question: Parameters<typeof store.showQuestion>[0];
      index: number;
      total: number;
      endsAt: number;
    }) => {
      sfx.play("reveal");
      useGameStore.getState().showQuestion(p.question, p.index, p.total, p.endsAt);
    };
    const onReveal = (p: {
      correctIndex: number;
      leaderboard: Parameters<typeof store.reveal>[1];
    }) => {
      const picked = useGameStore.getState().selectedChoice;
      if (picked === p.correctIndex) sfx.play("correct");
      else if (picked !== null) sfx.play("wrong");
      useGameStore.getState().reveal(p.correctIndex, p.leaderboard);
    };
    const onOver = (p: { leaderboard: Parameters<typeof store.gameOver>[0] }) => {
      sfx.play("gameover");
      useGameStore.getState().gameOver(p.leaderboard);
    };

    socket.on("lobby:update", onLobby);
    socket.on("game:starting", onStarting);
    socket.on("question:show", onQuestion);
    socket.on("question:reveal", onReveal);
    socket.on("game:over", onOver);

    return () => {
      socket.off("lobby:update", onLobby);
      socket.off("game:starting", onStarting);
      socket.off("question:show", onQuestion);
      socket.off("question:reveal", onReveal);
      socket.off("game:over", onOver);
    };
  }, [store]);

  const host = useCallback(
    (hostName: string, difficulty: "easy" | "medium" | "hard" = "easy") =>
      new Promise<string>((resolve) => {
        sfx.resume(); // unlock audio on this user gesture
        const socket = getSocket();
        if (!socket.connected) socket.connect();
        socket.emit("host:create", { hostName, difficulty }, ({ gameCode }) => {
          useGameStore
            .getState()
            .enter({ gameCode, myId: socket.id ?? "", isHost: true });
          resolve(gameCode);
        });
      }),
    [],
  );

  const join = useCallback(
    (gameCode: string, name: string) =>
      new Promise<{ ok: boolean; error?: string }>((resolve) => {
        sfx.resume(); // unlock audio on this user gesture
        const socket = getSocket();
        if (!socket.connected) socket.connect();
        socket.emit("lobby:join", { gameCode, name }, (res) => {
          if (res.ok) {
            useGameStore
              .getState()
              .enter({ gameCode, myId: socket.id ?? "", isHost: false });
          }
          resolve(res);
        });
      }),
    [],
  );

  const start = useCallback(() => getSocket().emit("game:start"), []);

  const answer = useCallback((questionId: string, choiceIndex: number) => {
    sfx.play("click");
    useGameStore.getState().selectChoice(choiceIndex);
    getSocket().emit("answer:submit", {
      questionId,
      choiceIndex,
      clientTs: Date.now(),
    });
  }, []);

  return { host, join, start, answer };
}
