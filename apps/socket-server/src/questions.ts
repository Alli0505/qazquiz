import { randomUUID } from "node:crypto";

import { db, questions as questionsTable } from "@qazquiz/db";
import type { Difficulty, LocalizedString, Question } from "@qazquiz/types";
import { and, eq, isNull, sql } from "drizzle-orm";

/**
 * MVP demo quiz banks. In production these come from Postgres (the
 * `questions` table). Prompts and choices are localized ({ en, kz });
 * the client renders the player's chosen language and falls back to `en`.
 *
 * Each game draws a random subset (QUESTIONS_PER_GAME) from the bank that
 * matches the chosen difficulty:
 *  - easy: general knowledge + light logic, 15s per question
 *  - hard: tough logical / abstract puzzles, 120s (2 min) per question
 */
const QUIZ_ID = "00000000-0000-0000-0000-000000000001";
export const QUESTIONS_PER_GAME = 10;
const HARD_TIME_LIMIT = 120; // seconds
const EASY_TIME_LIMIT = 15;

export interface RawQuestion {
  prompt: LocalizedString;
  choices: LocalizedString[];
  correctIndex: number;
  timeLimit?: number;
  points?: number;
}

export const EASY_BANK: RawQuestion[] = [
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

// ── HARD: tough logical & abstract puzzles (2 minutes each) ───────────
export const HARD_BANK: RawQuestion[] = [
  {
    prompt: {
      en: "What comes next: 1, 11, 21, 1211, 111221, ?",
      kz: "Келесі қандай: 1, 11, 21, 1211, 111221, ?",
    },
    choices: [
      { en: "13112221", kz: "13112221" },
      { en: "312211", kz: "312211" },
      { en: "1112221", kz: "1112221" },
      { en: "122111", kz: "122111" },
    ],
    correctIndex: 1, // look-and-say sequence
  },
  {
    prompt: {
      en: "What is the next number: 1, 2, 6, 24, 120, ?",
      kz: "Келесі сан: 1, 2, 6, 24, 120, ?",
    },
    choices: [
      { en: "600", kz: "600" },
      { en: "720", kz: "720" },
      { en: "840", kz: "840" },
      { en: "5040", kz: "5040" },
    ],
    correctIndex: 1, // factorials
  },
  {
    prompt: {
      en: "If 3 cats catch 3 mice in 3 minutes, how many cats catch 100 mice in 100 minutes?",
      kz: "3 мысық 3 тышқанды 3 минутта ұстаса, 100 тышқанды 100 минутта неше мысық ұстайды?",
    },
    choices: [
      { en: "3", kz: "3" },
      { en: "9", kz: "9" },
      { en: "33", kz: "33" },
      { en: "100", kz: "100" },
    ],
    correctIndex: 0,
  },
  {
    prompt: {
      en: "What is the angle between the hour and minute hands at 3:15?",
      kz: "Сағат 3:15-те сағат пен минут тілдерінің арасындағы бұрыш қанша?",
    },
    choices: [
      { en: "0°", kz: "0°" },
      { en: "7.5°", kz: "7.5°" },
      { en: "5°", kz: "5°" },
      { en: "2.5°", kz: "2.5°" },
    ],
    correctIndex: 1,
  },
  {
    prompt: {
      en: "Some bloops are razzles. All razzles are lazzles. Therefore:",
      kz: "Кейбір блуптар — раззл. Барлық раззл — лаззл. Демек:",
    },
    choices: [
      { en: "Some bloops are lazzles", kz: "Кейбір блуптар — лаззл" },
      { en: "No bloops are lazzles", kz: "Бірде-бір блуп лаззл емес" },
      { en: "All bloops are lazzles", kz: "Барлық блуп — лаззл" },
      { en: "Cannot be determined", kz: "Анықтау мүмкін емес" },
    ],
    correctIndex: 0,
  },
  {
    prompt: {
      en: "Which number is the odd one out: 8, 27, 64, 100, 125?",
      kz: "Қай сан артық: 8, 27, 64, 100, 125?",
    },
    choices: [
      { en: "8", kz: "8" },
      { en: "64", kz: "64" },
      { en: "100", kz: "100" },
      { en: "125", kz: "125" },
    ],
    correctIndex: 2, // others are perfect cubes
  },
  {
    prompt: {
      en: "A house has all four walls facing south. A bear walks by. What color is the bear?",
      kz: "Үйдің төрт қабырғасы да оңтүстікке қараған. Жанынан аю өтіп барады. Аюдың түсі қандай?",
    },
    choices: [
      { en: "White", kz: "Ақ" },
      { en: "Brown", kz: "Қоңыр" },
      { en: "Black", kz: "Қара" },
      { en: "Grey", kz: "Сұр" },
    ],
    correctIndex: 0, // house at the North Pole → polar bear
  },
  {
    prompt: {
      en: "Monty Hall: 3 doors, you pick one, the host opens another revealing a goat. If you switch, what is your chance to win?",
      kz: "Монти Холл: 3 есік, біреуін таңдайсыз, жүргізуші ешкі бар басқа есікті ашады. Ауыссаңыз, ұту ықтималдығы қанша?",
    },
    choices: [
      { en: "1/2", kz: "1/2" },
      { en: "1/3", kz: "1/3" },
      { en: "2/3", kz: "2/3" },
      { en: "3/4", kz: "3/4" },
    ],
    correctIndex: 2,
  },
  {
    prompt: {
      en: "What is the next number: 2, 5, 10, 17, 26, ?",
      kz: "Келесі сан: 2, 5, 10, 17, 26, ?",
    },
    choices: [
      { en: "35", kz: "35" },
      { en: "36", kz: "36" },
      { en: "37", kz: "37" },
      { en: "50", kz: "50" },
    ],
    correctIndex: 2, // n^2 + 1
  },
  {
    prompt: {
      en: "A snail climbs 3 m up a 10 m well each day and slips 2 m each night. How many days to reach the top?",
      kz: "Ұлу 10 м құдыққа күндіз 3 м көтеріліп, түнде 2 м сырғанайды. Шыңға жету үшін неше күн қажет?",
    },
    choices: [
      { en: "5", kz: "5" },
      { en: "7", kz: "7" },
      { en: "8", kz: "8" },
      { en: "10", kz: "10" },
    ],
    correctIndex: 2,
  },
  {
    prompt: {
      en: "What is the next number: 1, 2, 4, 7, 11, 16, ?",
      kz: "Келесі сан: 1, 2, 4, 7, 11, 16, ?",
    },
    choices: [
      { en: "21", kz: "21" },
      { en: "22", kz: "22" },
      { en: "23", kz: "23" },
      { en: "28", kz: "28" },
    ],
    correctIndex: 1, // +1,+2,+3,...
  },
  {
    prompt: {
      en: "Two towns are 100 km apart. Two trains leave toward each other at 50 km/h each. A bird flies 75 km/h between them until they meet. How far does the bird fly?",
      kz: "Екі қала 100 км қашықтықта. Екі пойыз бір-біріне қарай 50 км/сағ жылдамдықпен шығады. Құс олардың арасында кездескенше 75 км/сағ ұшады. Құс қанша км ұшады?",
    },
    choices: [
      { en: "50 km", kz: "50 км" },
      { en: "75 km", kz: "75 км" },
      { en: "100 km", kz: "100 км" },
      { en: "150 km", kz: "150 км" },
    ],
    correctIndex: 1, // they meet in 1 hour
  },
  {
    prompt: {
      en: "What is the next number: 3, 7, 15, 31, 63, ?",
      kz: "Келесі сан: 3, 7, 15, 31, 63, ?",
    },
    choices: [
      { en: "95", kz: "95" },
      { en: "126", kz: "126" },
      { en: "127", kz: "127" },
      { en: "128", kz: "128" },
    ],
    correctIndex: 2, // ×2 + 1
  },
  {
    prompt: {
      en: "In a race, you overtake the runner in 2nd place. What position are you in now?",
      kz: "Жарыста сіз 2-орындағы жүгірушіні басып озасыз. Енді қай орындасыз?",
    },
    choices: [
      { en: "1st", kz: "1-ші" },
      { en: "2nd", kz: "2-ші" },
      { en: "3rd", kz: "3-ші" },
      { en: "Last", kz: "Соңғы" },
    ],
    correctIndex: 1,
  },
  {
    prompt: {
      en: "How many times can you subtract 5 from 25?",
      kz: "25-тен 5-ті неше рет азайтуға болады?",
    },
    choices: [
      { en: "Once", kz: "Бір рет" },
      { en: "4 times", kz: "4 рет" },
      { en: "5 times", kz: "5 рет" },
      { en: "Infinite", kz: "Шексіз" },
    ],
    correctIndex: 0, // after subtracting once it's 20, not 25
  },
  {
    prompt: {
      en: "Roll two dice. What is the probability the sum equals 7?",
      kz: "Екі сүйек лақтырылды. Қосындысы 7-ге тең болу ықтималдығы қанша?",
    },
    choices: [
      { en: "1/6", kz: "1/6" },
      { en: "1/8", kz: "1/8" },
      { en: "5/36", kz: "5/36" },
      { en: "1/12", kz: "1/12" },
    ],
    correctIndex: 0, // 6 of 36 outcomes
  },
  {
    prompt: {
      en: "In the puzzle SEND + MORE = MONEY, what digit does M represent?",
      kz: "SEND + MORE = MONEY жұмбағында M қай цифрды білдіреді?",
    },
    choices: [
      { en: "0", kz: "0" },
      { en: "1", kz: "1" },
      { en: "8", kz: "8" },
      { en: "9", kz: "9" },
    ],
    correctIndex: 1,
  },
  {
    prompt: {
      en: "What is the next number: 2, 12, 36, 80, 150, ?",
      kz: "Келесі сан: 2, 12, 36, 80, 150, ?",
    },
    choices: [
      { en: "210", kz: "210" },
      { en: "240", kz: "240" },
      { en: "252", kz: "252" },
      { en: "300", kz: "300" },
    ],
    correctIndex: 2, // n^2 + n^3
  },
  {
    prompt: {
      en: "What is the next number: 6, 12, 21, 33, ?",
      kz: "Келесі сан: 6, 12, 21, 33, ?",
    },
    choices: [
      { en: "45", kz: "45" },
      { en: "48", kz: "48" },
      { en: "51", kz: "51" },
      { en: "54", kz: "54" },
    ],
    correctIndex: 1, // +6,+9,+12,+15
  },
  {
    prompt: {
      en: "A is the father of B, but B is not the son of A. How is this possible?",
      kz: "A — B-нің әкесі, бірақ B — A-ның ұлы емес. Бұл қалай мүмкін?",
    },
    choices: [
      { en: "B is a daughter", kz: "B — қыз" },
      { en: "A is lying", kz: "A өтірік айтып тұр" },
      { en: "It is impossible", kz: "Мүмкін емес" },
      { en: "B is adopted", kz: "B — асырап алынған" },
    ],
    correctIndex: 0,
  },
];

export const BANKS: Record<Difficulty, RawQuestion[]> = {
  easy: EASY_BANK,
  hard: HARD_BANK,
};

export const DEFAULT_TIME_LIMIT: Record<Difficulty, number> = {
  easy: EASY_TIME_LIMIT,
  hard: HARD_TIME_LIMIT,
};

/** In-place Fisher–Yates shuffle on a copy of the input array. */
function shuffled<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Draw a random subset of the chosen difficulty's bank, freshly id'd. */
export function demoQuestions(
  difficulty: Difficulty = "easy",
  count = QUESTIONS_PER_GAME,
): Question[] {
  const bank = BANKS[difficulty];
  return shuffled(bank)
    .slice(0, Math.min(count, bank.length))
    .map((q) => ({
      ...q,
      id: randomUUID(),
      quizId: QUIZ_ID,
      timeLimit: q.timeLimit ?? DEFAULT_TIME_LIMIT[difficulty],
      points: q.points ?? 1000,
    }));
}

/**
 * Load a random set of questions for a game. Prefers Postgres (the bank
 * questions for the chosen difficulty); falls back to the in-memory bank
 * if the DB is unreachable or hasn't been seeded yet.
 */
export async function loadQuestions(
  difficulty: Difficulty = "easy",
  count = QUESTIONS_PER_GAME,
): Promise<Question[]> {
  try {
    const rows = await db
      .select()
      .from(questionsTable)
      .where(
        and(
          eq(questionsTable.difficulty, difficulty),
          eq(questionsTable.isActive, true),
          isNull(questionsTable.quizId),
        ),
      )
      .orderBy(sql`random()`)
      .limit(count);

    if (rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        quizId: r.quizId ?? QUIZ_ID,
        prompt: r.prompt,
        choices: r.choices,
        correctIndex: r.correctIndex,
        timeLimit: r.timeLimit,
        points: r.points,
      }));
    }
    console.warn(
      `[questions] DB has no ${difficulty} bank questions — using in-memory fallback`,
    );
  } catch (err) {
    console.warn(
      `[questions] DB load failed (${(err as Error).message}) — using in-memory fallback`,
    );
  }
  return demoQuestions(difficulty, count);
}
