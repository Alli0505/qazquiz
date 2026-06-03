import { randomUUID } from "node:crypto";

import type { Question } from "@qazquiz/types";

/**
 * MVP demo quiz. In production these come from Postgres (the `questions`
 * table) loaded when a host opens a room for a given quiz id.
 *
 * Prompts and choices are localized ({ en, kz }); the client renders the
 * player's chosen language and falls back to `en`.
 */
const QUIZ_ID = "00000000-0000-0000-0000-000000000001";

export function demoQuestions(): Question[] {
  const raw: Array<Omit<Question, "id" | "quizId">> = [
    {
      prompt: {
        en: "What is the capital of Kazakhstan?",
        kz: "Қазақстанның астанасы қай қала?",
      },
      choices: [
        { en: "Almaty", kz: "Алматы" },
        { en: "Astana", kz: "Астана" },
        { en: "Shymkent", kz: "Шымкент" },
        { en: "Karaganda", kz: "Қарағанды" },
      ],
      correctIndex: 1,
      timeLimit: 15,
      points: 1000,
    },
    {
      prompt: {
        en: "Which language runs natively in a web browser?",
        kz: "Веб-браузерде түпнұсқалы түрде қай тіл жұмыс істейді?",
      },
      choices: [
        { en: "Python", kz: "Python" },
        { en: "C++", kz: "C++" },
        { en: "JavaScript", kz: "JavaScript" },
        { en: "Rust", kz: "Rust" },
      ],
      correctIndex: 2,
      timeLimit: 15,
      points: 1000,
    },
    {
      prompt: {
        en: "How many continents are there on Earth?",
        kz: "Жер бетінде неше құрлық бар?",
      },
      choices: [
        { en: "5", kz: "5" },
        { en: "6", kz: "6" },
        { en: "7", kz: "7" },
        { en: "8", kz: "8" },
      ],
      correctIndex: 2,
      timeLimit: 15,
      points: 1000,
    },
    {
      prompt: {
        en: "What does CPU stand for?",
        kz: "CPU аббревиатурасы нені білдіреді?",
      },
      choices: [
        { en: "Central Processing Unit", kz: "Орталық өңдеу құрылғысы" },
        { en: "Computer Power Unit", kz: "Компьютердің қуат блогы" },
        { en: "Central Process Utility", kz: "Орталық процесс утилитасы" },
        { en: "Core Processing Unit", kz: "Ядролық өңдеу құрылғысы" },
      ],
      correctIndex: 0,
      timeLimit: 15,
      points: 1000,
    },
    {
      prompt: {
        en: "Which planet is known as the Red Planet?",
        kz: "Қай планета Қызыл планета деп аталады?",
      },
      choices: [
        { en: "Venus", kz: "Венера" },
        { en: "Jupiter", kz: "Юпитер" },
        { en: "Mars", kz: "Марс" },
        { en: "Saturn", kz: "Сатурн" },
      ],
      correctIndex: 2,
      timeLimit: 15,
      points: 1000,
    },
  ];

  return raw.map((q) => ({ ...q, id: randomUUID(), quizId: QUIZ_ID }));
}
