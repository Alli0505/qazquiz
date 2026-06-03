"use client";

import { useCallback, useEffect } from "react";

import { getSocket } from "./socket";
import { useGameStore } from "~/store/game-store";

/**
 * Connects the shared socket, wires every ServerToClientEvent into the
 * Zustand store, and returns the client-side actions. Mount once per
 * game screen (host or play).
 */
export function useGameSocket() {
  const store = useGameStore();

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const onLobby = (p: { players: Parameters<typeof store.setLobby>[0]; hostId: string }) =>
      useGameStore.getState().setLobby(p.players, p.hostId);
    const onStarting = () => useGameStore.getState().setPhase("STARTING");
    const onQuestion = (p: {
      question: Parameters<typeof store.showQuestion>[0];
      index: number;
      total: number;
      endsAt: number;
    }) => useGameStore.getState().showQuestion(p.question, p.index, p.total, p.endsAt);
    const onReveal = (p: {
      correctIndex: number;
      leaderboard: Parameters<typeof store.reveal>[1];
    }) => useGameStore.getState().reveal(p.correctIndex, p.leaderboard);
    const onOver = (p: { leaderboard: Parameters<typeof store.gameOver>[0] }) =>
      useGameStore.getState().gameOver(p.leaderboard);

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
    (hostName: string) =>
      new Promise<string>((resolve) => {
        const socket = getSocket();
        if (!socket.connected) socket.connect();
        socket.emit("host:create", { hostName }, ({ gameCode }) => {
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
    useGameStore.getState().selectChoice(choiceIndex);
    getSocket().emit("answer:submit", {
      questionId,
      choiceIndex,
      clientTs: Date.now(),
    });
  }, []);

  return { host, join, start, answer };
}
