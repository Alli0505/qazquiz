import { randomUUID } from "node:crypto";

import type { Question } from "@qazquiz/types";

/**
 * MVP demo quiz. In production these come from Postgres (the `questions`
 * table) loaded when a host opens a room for a given quiz id.
 */
const QUIZ_ID = "00000000-0000-0000-0000-000000000001";

export function demoQuestions(): Question[] {
  const raw: Array<Omit<Question, "id" | "quizId">> = [
    {
      prompt: "What is the capital of Kazakhstan?",
      choices: ["Almaty", "Astana", "Shymkent", "Karaganda"],
      correctIndex: 1,
      timeLimit: 15,
      points: 1000,
    },
    {
      prompt: "Which language runs natively in a web browser?",
      choices: ["Python", "C++", "JavaScript", "Rust"],
      correctIndex: 2,
      timeLimit: 15,
      points: 1000,
    },
    {
      prompt: "How many continents are there on Earth?",
      choices: ["5", "6", "7", "8"],
      correctIndex: 2,
      timeLimit: 15,
      points: 1000,
    },
    {
      prompt: "What does CPU stand for?",
      choices: [
        "Central Processing Unit",
        "Computer Power Unit",
        "Central Process Utility",
        "Core Processing Unit",
      ],
      correctIndex: 0,
      timeLimit: 15,
      points: 1000,
    },
    {
      prompt: "Which planet is known as the Red Planet?",
      choices: ["Venus", "Jupiter", "Mars", "Saturn"],
      correctIndex: 2,
      timeLimit: 15,
      points: 1000,
    },
  ];

  return raw.map((q) => ({ ...q, id: randomUUID(), quizId: QUIZ_ID }));
}
