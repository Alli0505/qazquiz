import { randomUUID } from "node:crypto";

import type { LocalizedString, Question } from "@qazquiz/types";

/**
 * MVP demo quiz bank. In production these come from Postgres (the
 * `questions` table). Prompts and choices are localized ({ en, kz });
 * the client renders the player's chosen language and falls back to `en`.
 *
 * Each game draws a random subset (QUESTIONS_PER_GAME) from this bank.
 */
const QUIZ_ID = "00000000-0000-0000-0000-000000000001";
export const QUESTIONS_PER_GAME = 10;

interface RawQuestion {
  prompt: LocalizedString;
  choices: LocalizedString[];
  correctIndex: number;
  timeLimit?: number;
  points?: number;
}

const BANK: RawQuestion[] = [
  // ── General knowledge ──────────────────────────────────────────────
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
  },
  {
    prompt: {
      en: "What is the largest ocean on Earth?",
      kz: "Жердегі ең үлкен мұхит қайсы?",
    },
    choices: [
      { en: "Atlantic", kz: "Атлант" },
      { en: "Indian", kz: "Үнді" },
      { en: "Arctic", kz: "Солтүстік Мұзды" },
      { en: "Pacific", kz: "Тынық" },
    ],
    correctIndex: 3,
  },
  {
    prompt: {
      en: "How many sides does a hexagon have?",
      kz: "Алтыбұрыштың неше қабырғасы бар?",
    },
    choices: [
      { en: "5", kz: "5" },
      { en: "6", kz: "6" },
      { en: "7", kz: "7" },
      { en: "8", kz: "8" },
    ],
    correctIndex: 1,
  },
  {
    prompt: {
      en: "Which gas do plants absorb from the air?",
      kz: "Өсімдіктер ауадан қай газды сіңіреді?",
    },
    choices: [
      { en: "Oxygen", kz: "Оттегі" },
      { en: "Carbon dioxide", kz: "Көмірқышқыл газы" },
      { en: "Nitrogen", kz: "Азот" },
      { en: "Hydrogen", kz: "Сутегі" },
    ],
    correctIndex: 1,
  },

  // ── Logic & reasoning ──────────────────────────────────────────────
  {
    prompt: {
      en: "What number comes next: 2, 4, 8, 16, ?",
      kz: "Келесі сан қандай: 2, 4, 8, 16, ?",
    },
    choices: [
      { en: "24", kz: "24" },
      { en: "30", kz: "30" },
      { en: "32", kz: "32" },
      { en: "64", kz: "64" },
    ],
    correctIndex: 2,
  },
  {
    prompt: {
      en: "What number comes next: 1, 1, 2, 3, 5, 8, ?",
      kz: "Келесі сан қандай: 1, 1, 2, 3, 5, 8, ?",
    },
    choices: [
      { en: "11", kz: "11" },
      { en: "12", kz: "12" },
      { en: "13", kz: "13" },
      { en: "21", kz: "21" },
    ],
    correctIndex: 2,
  },
  {
    prompt: {
      en: "Which number is the odd one out: 3, 5, 7, 8, 11?",
      kz: "Қай сан артық: 3, 5, 7, 8, 11?",
    },
    choices: [
      { en: "3", kz: "3" },
      { en: "7", kz: "7" },
      { en: "8", kz: "8" },
      { en: "11", kz: "11" },
    ],
    correctIndex: 2,
  },
  {
    prompt: {
      en: "If A > B and B > C, then:",
      kz: "Егер A > B және B > C болса, онда:",
    },
    choices: [
      { en: "A > C", kz: "A > C" },
      { en: "A < C", kz: "A < C" },
      { en: "A = C", kz: "A = C" },
      { en: "Cannot tell", kz: "Анықтау мүмкін емес" },
    ],
    correctIndex: 0,
  },
  {
    prompt: {
      en: "A bat and a ball cost $1.10 together. The bat costs $1.00 more than the ball. How much is the ball?",
      kz: "Бита мен доп бірге $1.10 тұрады. Бита доптан $1.00 қымбат. Доп қанша тұрады?",
    },
    choices: [
      { en: "$0.05", kz: "$0.05" },
      { en: "$0.10", kz: "$0.10" },
      { en: "$1.00", kz: "$1.00" },
      { en: "$0.15", kz: "$0.15" },
    ],
    correctIndex: 0,
    timeLimit: 25,
  },
  {
    prompt: {
      en: "Monday is to Tuesday as June is to ?",
      kz: "Дүйсенбі — Сейсенбі болса, Маусым — ?",
    },
    choices: [
      { en: "May", kz: "Мамыр" },
      { en: "July", kz: "Шілде" },
      { en: "August", kz: "Тамыз" },
      { en: "January", kz: "Қаңтар" },
    ],
    correctIndex: 1,
  },
  {
    prompt: {
      en: "If today is Wednesday, what day will it be in 3 days?",
      kz: "Бүгін сәрсенбі болса, 3 күннен кейін қай күн болады?",
    },
    choices: [
      { en: "Friday", kz: "Жұма" },
      { en: "Saturday", kz: "Сенбі" },
      { en: "Sunday", kz: "Жексенбі" },
      { en: "Monday", kz: "Дүйсенбі" },
    ],
    correctIndex: 1,
  },
  {
    prompt: {
      en: "What is 15% of 200?",
      kz: "200-дің 15%-ы қанша?",
    },
    choices: [
      { en: "15", kz: "15" },
      { en: "20", kz: "20" },
      { en: "30", kz: "30" },
      { en: "45", kz: "45" },
    ],
    correctIndex: 2,
  },
  {
    prompt: {
      en: "Which is heavier: 1 kg of iron or 1 kg of feathers?",
      kz: "Қайсысы ауыр: 1 кг темір ме әлде 1 кг қауырсын ба?",
    },
    choices: [
      { en: "Iron", kz: "Темір" },
      { en: "Feathers", kz: "Қауырсын" },
      { en: "They weigh the same", kz: "Екеуі бірдей" },
      { en: "Cannot tell", kz: "Анықтау мүмкін емес" },
    ],
    correctIndex: 2,
  },
  {
    prompt: {
      en: "How many months of the year have 28 days?",
      kz: "Жылдың неше айында 28 күн болады?",
    },
    choices: [
      { en: "1", kz: "1" },
      { en: "2", kz: "2" },
      { en: "All 12", kz: "Барлық 12-сі" },
      { en: "6", kz: "6" },
    ],
    correctIndex: 2,
  },
  {
    prompt: {
      en: "A farmer has 17 sheep. All but 9 run away. How many are left?",
      kz: "Фермерде 17 қой бар. 9-ынан басқасы қашып кетті. Нешеуі қалды?",
    },
    choices: [
      { en: "8", kz: "8" },
      { en: "9", kz: "9" },
      { en: "17", kz: "17" },
      { en: "0", kz: "0" },
    ],
    correctIndex: 1,
  },
];

/** In-place Fisher–Yates shuffle on a copy of the input array. */
function shuffled<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Draw a random subset of the bank, freshly id'd, for one game. */
export function demoQuestions(count = QUESTIONS_PER_GAME): Question[] {
  return shuffled(BANK)
    .slice(0, Math.min(count, BANK.length))
    .map((q) => ({
      ...q,
      id: randomUUID(),
      quizId: QUIZ_ID,
      timeLimit: q.timeLimit ?? 15,
      points: q.points ?? 1000,
    }));
}
