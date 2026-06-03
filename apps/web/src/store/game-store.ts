import type {
  GamePhase,
  LeaderboardEntry,
  Player,
  PublicQuestion,
} from "@qazquiz/types";
import { create } from "zustand";

interface GameState {
  phase: GamePhase;
  gameCode: string | null;
  myId: string | null;
  isHost: boolean;
  hostId: string | null;
  players: Player[];

  question: PublicQuestion | null;
  questionIndex: number;
  questionTotal: number;
  endsAt: number | null;
  selectedChoice: number | null;
  correctIndex: number | null;
  leaderboard: LeaderboardEntry[];

  enter: (opts: { gameCode: string; myId: string; isHost: boolean }) => void;
  setLobby: (players: Player[], hostId: string) => void;
  setPhase: (phase: GamePhase) => void;
  showQuestion: (
    q: PublicQuestion,
    index: number,
    total: number,
    endsAt: number,
  ) => void;
  selectChoice: (i: number) => void;
  reveal: (correctIndex: number, leaderboard: LeaderboardEntry[]) => void;
  gameOver: (leaderboard: LeaderboardEntry[]) => void;
  reset: () => void;
}

const initial = {
  phase: "LOBBY" as GamePhase,
  gameCode: null,
  myId: null,
  isHost: false,
  hostId: null,
  players: [] as Player[],
  question: null,
  questionIndex: 0,
  questionTotal: 0,
  endsAt: null,
  selectedChoice: null,
  correctIndex: null,
  leaderboard: [] as LeaderboardEntry[],
};

export const useGameStore = create<GameState>((set) => ({
  ...initial,

  enter: ({ gameCode, myId, isHost }) =>
    set({ ...initial, gameCode, myId, isHost, phase: "LOBBY" }),
  setLobby: (players, hostId) => set({ players, hostId }),
  setPhase: (phase) => set({ phase }),
  showQuestion: (question, questionIndex, questionTotal, endsAt) =>
    set({
      phase: "QUESTION_ACTIVE",
      question,
      questionIndex,
      questionTotal,
      endsAt,
      selectedChoice: null,
      correctIndex: null,
    }),
  selectChoice: (selectedChoice) => set({ selectedChoice }),
  reveal: (correctIndex, leaderboard) =>
    set({ phase: "ANSWER_REVEAL", correctIndex, leaderboard }),
  gameOver: (leaderboard) => set({ phase: "GAME_OVER", leaderboard }),
  reset: () => set(initial),
}));
