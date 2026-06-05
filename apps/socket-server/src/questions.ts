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
 *  - easy:   general knowledge + light logic, 15s per question
 *  - medium: tough logical / abstract puzzles, 60s (1 min) per question
 *  - hard:   story-based critical-thinking puzzles, 300s (5 min) per question
 */
const QUIZ_ID = "00000000-0000-0000-0000-000000000001";
export const QUESTIONS_PER_GAME = 10;
const EASY_TIME_LIMIT = 15;
const MEDIUM_TIME_LIMIT = 60;
const HARD_TIME_LIMIT = 300;

export interface RawQuestion {
  prompt: LocalizedString;
  choices: LocalizedString[];
  correctIndex: number;
  timeLimit?: number;
  points?: number;
  icon?: string;
}

const EASY_BANK_RAW: RawQuestion[] = [
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

// ── MEDIUM: tough logical & abstract puzzles (1 minute each) ──────────
const MEDIUM_BANK_RAW: RawQuestion[] = [
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

// ── HARD: story-based critical-thinking puzzles (5 minutes each) ──────
const HARD_BANK_RAW: RawQuestion[] = [
  {
    prompt: {
      en: "On an island, knights always tell the truth and knaves always lie. You meet A and B. A says: 'We are both knaves.' What are A and B?",
      kz: "Аралда рыцарьлар әрқашан шындықты, ал жалғаншылар әрқашан өтірік айтады. Сіз A мен B-ні кездестірдіңіз. A: «Екеуміз де жалғаншымыз» дейді. A мен B кім?",
    },
    choices: [
      { en: "A is a knight, B is a knave", kz: "A — рыцарь, B — жалғаншы" },
      { en: "A is a knave, B is a knight", kz: "A — жалғаншы, B — рыцарь" },
      { en: "Both are knaves", kz: "Екеуі де жалғаншы" },
      { en: "Both are knights", kz: "Екеуі де рыцарь" },
    ],
    correctIndex: 1,
  },
  {
    prompt: {
      en: "Three boxes are labeled 'Apples', 'Oranges', and 'Apples & Oranges'. Every label is wrong. Drawing one fruit from a single box, which box lets you correctly relabel all three?",
      kz: "Үш жәшік «Алма», «Апельсин» және «Алма мен Апельсин» деп белгіленген. Барлық белгі қате. Бір жәшіктен бір жеміс алып, үшеуін де дұрыс белгілеу үшін қай жәшіктен алу керек?",
    },
    choices: [
      { en: "The one labeled 'Apples'", kz: "«Алма» деп белгіленгені" },
      { en: "The one labeled 'Oranges'", kz: "«Апельсин» деп белгіленгені" },
      {
        en: "The one labeled 'Apples & Oranges'",
        kz: "«Алма мен Апельсин» деп белгіленгені",
      },
      { en: "Any box works", kz: "Кез келген жәшік жарайды" },
    ],
    correctIndex: 2,
  },
  {
    prompt: {
      en: "A disease affects 1 in 10,000 people. A test is 99% accurate. You test positive. Roughly what is the probability you actually have the disease?",
      kz: "Ауру 10 000 адамның 1-іне әсер етеді. Тест 99% дәл. Нәтижеңіз оң шықты. Сізде шынымен ауру болу ықтималдығы шамамен қанша?",
    },
    choices: [
      { en: "About 99%", kz: "Шамамен 99%" },
      { en: "About 90%", kz: "Шамамен 90%" },
      { en: "About 50%", kz: "Шамамен 50%" },
      { en: "About 1%", kz: "Шамамен 1%" },
    ],
    correctIndex: 3,
  },
  {
    prompt: {
      en: "Outside a sealed room are 3 switches; one turns on a bulb inside. You may flip switches freely but can enter the room only once. How do you find the right switch?",
      kz: "Жабық бөлменің сыртында 3 қосқыш бар; біреуі іштегі шамды қосады. Қосқыштарды қалағаныңызша баса аласыз, бірақ бөлмеге тек бір рет кіресіз. Дұрыс қосқышты қалай табасыз?",
    },
    choices: [
      { en: "It is impossible with one entry", kz: "Бір кіріспен мүмкін емес" },
      {
        en: "Turn one on a while then off; turn another on; enter — use the bulb's light and warmth",
        kz: "Біреуін біраз қосып өшіріңіз; екіншісін қосыңыз; кіріп — шамның жарығы мен жылуын пайдаланыңыз",
      },
      { en: "Switch all three on, then enter", kz: "Үшеуін де қосып, кіріңіз" },
      { en: "Ask someone inside", kz: "Іштегі біреуден сұраңыз" },
    ],
    correctIndex: 1,
  },
  {
    prompt: {
      en: "In a room of just 23 people, the probability that at least two share the same birthday is closest to:",
      kz: "Бар болғаны 23 адам бар бөлмеде кемінде екеуінің туған күні бірдей болу ықтималдығы неге жақын?",
    },
    choices: [
      { en: "About 6%", kz: "Шамамен 6%" },
      { en: "About 23%", kz: "Шамамен 23%" },
      { en: "About 50%", kz: "Шамамен 50%" },
      { en: "About 99%", kz: "Шамамен 99%" },
    ],
    correctIndex: 2,
  },
  {
    prompt: {
      en: "A man pushes his car up to a hotel and immediately announces he is bankrupt. Why?",
      kz: "Бір адам көлігін қонақүйге дейін итеріп әкеліп, бірден банкрот екенін айтады. Неліктен?",
    },
    choices: [
      { en: "His car broke down", kz: "Көлігі бұзылған" },
      { en: "He is playing Monopoly", kz: "Ол «Монополия» ойнап жатыр" },
      { en: "He lost his wallet", kz: "Әмиянын жоғалтқан" },
      { en: "The hotel is too expensive", kz: "Қонақүй тым қымбат" },
    ],
    correctIndex: 1,
  },
  {
    prompt: {
      en: "You have 9 identical-looking coins; exactly one is slightly heavier. Using only a balance scale, what is the minimum number of weighings that guarantees finding it?",
      kz: "Сізде 9 бірдей көрінетін монета бар; нақ біреуі сәл ауырлау. Тек теңгерме таразымен оны табуға кепілдік беретін ең аз өлшеу саны қанша?",
    },
    choices: [
      { en: "1", kz: "1" },
      { en: "2", kz: "2" },
      { en: "3", kz: "3" },
      { en: "4", kz: "4" },
    ],
    correctIndex: 1,
  },
  {
    prompt: {
      en: "Two fathers and two sons go fishing. Each catches exactly one fish, yet only three fish are caught in total. How?",
      kz: "Екі әке мен екі ұл балық аулауға барды. Әрқайсысы нақ бір балық ұстады, бірақ бәрі болып үш-ақ балық ұсталды. Қалай?",
    },
    choices: [
      { en: "One fish escaped", kz: "Бір балық қашып кетті" },
      { en: "They miscounted", kz: "Қате санаған" },
      {
        en: "They are a grandfather, a father, and a son",
        kz: "Олар — ата, әке және ұл",
      },
      { en: "One of them caught two", kz: "Біреуі екеуін ұстады" },
    ],
    correctIndex: 2,
  },
  {
    prompt: {
      en: "All of Anna's friends speak French. Some people who speak French are teachers. Which statement MUST be true?",
      kz: "Аннаның барлық достары француз тілінде сөйлейді. Француз тілінде сөйлейтін кейбіреулер — мұғалім. Қай тұжырым МІНДЕТТІ ТҮРДЕ ақиқат?",
    },
    choices: [
      {
        en: "Some of Anna's friends are teachers",
        kz: "Аннаның кейбір достары — мұғалім",
      },
      {
        en: "None of Anna's friends are teachers",
        kz: "Аннаның бірде-бір досы мұғалім емес",
      },
      {
        en: "Nothing certain can be concluded about that",
        kz: "Бұл туралы нақты қорытынды жасауға болмайды",
      },
      {
        en: "All of Anna's friends are teachers",
        kz: "Аннаның барлық достары — мұғалім",
      },
    ],
    correctIndex: 2,
  },
  {
    prompt: {
      en: "A woman shoots her husband, holds him under water for several minutes, then hangs him. An hour later they have dinner together. How?",
      kz: "Бір әйел күйеуін атып, бірнеше минут су астында ұстайды, сосын іліп қояды. Бір сағаттан соң олар бірге кешкі ас ішеді. Қалай?",
    },
    choices: [
      { en: "She is a photographer", kz: "Ол — фотограф" },
      { en: "He is a ghost", kz: "Күйеуі — елес" },
      { en: "It was only a dream", kz: "Бұл жай түс еді" },
      { en: "He has a twin brother", kz: "Күйеуінің егіз ағасы бар" },
    ],
    correctIndex: 0,
  },
  {
    prompt: {
      en: "You flip a fair coin three times. Given that at least one flip is heads, what is the probability that all three are heads?",
      kz: "Әділ тиынды үш рет лақтырдыңыз. Кемінде бір рет «бүркіт» түскені белгілі болса, үшеуінің де «бүркіт» болу ықтималдығы қанша?",
    },
    choices: [
      { en: "1/8", kz: "1/8" },
      { en: "1/7", kz: "1/7" },
      { en: "1/3", kz: "1/3" },
      { en: "1/2", kz: "1/2" },
    ],
    correctIndex: 1,
  },
  {
    prompt: {
      en: "Two doors: one leads to safety, one to death. One guard always lies, the other always tells the truth, but you don't know which is which. You may ask ONE guard ONE yes/no question. Which approach works?",
      kz: "Екі есік: біреуі — қауіпсіздікке, біреуі — өлімге. Бір күзетші әрқашан өтірік, екіншісі әрқашан шындық айтады, бірақ қайсысы екенін білмейсіз. Бір күзетшіге бір «иә/жоқ» сұрақ қоя аласыз. Қай тәсіл жұмыс істейді?",
    },
    choices: [
      { en: "Ask 'Are you the truth-teller?'", kz: "«Сіз шындық айтушысыз ба?» деп сұраңыз" },
      {
        en: "Ask 'Which door would the OTHER guard call safe?' then pick the other door",
        kz: "«Екінші күзетші қай есікті қауіпсіз дер еді?» деп сұрап, басқа есікті таңдаңыз",
      },
      { en: "Ask 'Is the left door safe?'", kz: "«Сол жақ есік қауіпсіз бе?» деп сұраңыз" },
      { en: "Ask 'Which door is safe?'", kz: "«Қай есік қауіпсіз?» деп сұраңыз" },
    ],
    correctIndex: 1,
  },
  {
    prompt: {
      en: "'If it rains, the match is cancelled. The match was cancelled. Therefore it rained.' This argument is:",
      kz: "«Егер жаңбыр жауса, матч болмай қалады. Матч болмай қалды. Демек, жаңбыр жауды.» Бұл пайымдау:",
    },
    choices: [
      { en: "Valid", kz: "Дұрыс (валид)" },
      {
        en: "Invalid — the match could be cancelled for other reasons",
        kz: "Қате — матч басқа себептермен де болмай қалуы мүмкін",
      },
      { en: "True by definition", kz: "Анықтама бойынша ақиқат" },
      { en: "Impossible to judge", kz: "Бағалау мүмкін емес" },
    ],
    correctIndex: 1,
  },
  {
    prompt: {
      en: "Sara is looking at John. John is looking at Mary. Sara is married; Mary is not. We don't know if John is married. Is a married person looking at an unmarried person?",
      kz: "Сара Джонға қарап тұр. Джон Мэриге қарап тұр. Сара — үйленген; Мэри — үйленбеген. Джон туралы белгісіз. Үйленген адам үйленбеген адамға қарап тұр ма?",
    },
    choices: [
      { en: "Yes", kz: "Иә" },
      { en: "No", kz: "Жоқ" },
      { en: "Not enough information", kz: "Ақпарат жеткіліксіз" },
      { en: "Only if John is married", kz: "Тек Джон үйленген болса" },
    ],
    correctIndex: 0,
  },
  {
    prompt: {
      en: "A bag holds 2 red and 2 blue balls. You draw two at once without looking. What is the probability both are the same color?",
      kz: "Қапта 2 қызыл және 2 көк шар бар. Қарамай бірден екеуін аласыз. Екеуінің түсі бірдей болу ықтималдығы қанша?",
    },
    choices: [
      { en: "1/2", kz: "1/2" },
      { en: "1/3", kz: "1/3" },
      { en: "1/4", kz: "1/4" },
      { en: "2/3", kz: "2/3" },
    ],
    correctIndex: 1,
  },
  {
    prompt: {
      en: "In a running race, if you overtake the person in last place, what position are you then in?",
      kz: "Жүгіру жарысында ең соңғы орындағы адамды басып озсаңыз, сіз қай орында боласыз?",
    },
    choices: [
      { en: "Last", kz: "Соңғы" },
      { en: "Second to last", kz: "Соңынан екінші" },
      {
        en: "You can't overtake the last-place person",
        kz: "Ең соңғы адамды басып озу мүмкін емес",
      },
      { en: "First", kz: "Бірінші" },
    ],
    correctIndex: 2,
  },
  {
    prompt: {
      en: "A man is found hanging in a sealed, empty, locked room with a puddle of water beneath him and no furniture. How did he do it?",
      kz: "Бір ер адам жабық, бос, кілттелген бөлмеде асылып тұрған күйде табылды; астында су көлшігі бар, жиһаз жоқ. Ол мұны қалай істеді?",
    },
    choices: [
      { en: "He climbed the walls", kz: "Қабырғаға өрмелеп шықты" },
      {
        en: "He stood on a large block of ice that then melted",
        kz: "Ірі мұз кесегінің үстіне тұрды, ол кейін еріп кетті",
      },
      { en: "Someone helped him", kz: "Біреу көмектесті" },
      { en: "There was a hidden ladder", kz: "Жасырын саты болған" },
    ],
    correctIndex: 1,
  },
  {
    prompt: {
      en: "A company reports '90% of customers are satisfied,' but only 10% of customers chose to return the survey. The biggest flaw in this claim is:",
      kz: "Бір компания «тұтынушылардың 90%-ы риза» дейді, бірақ сауалнаманы тұтынушылардың тек 10%-ы қайтарған. Бұл тұжырымдағы ең басты қате:",
    },
    choices: [
      { en: "The sample is too small", kz: "Таңдама тым кішкентай" },
      {
        en: "Self-selection bias — unhappy customers may not respond",
        kz: "Өзін-өзі іріктеу ауытқуы — ренжігендер жауап бермеуі мүмкін",
      },
      { en: "90% is not a majority", kz: "90% — көпшілік емес" },
      { en: "There is no flaw", kz: "Ешқандай қате жоқ" },
    ],
    correctIndex: 1,
  },
  {
    prompt: {
      en: "All cats are mammals. No mammals are reptiles. Which conclusion is logically valid?",
      kz: "Барлық мысықтар — сүтқоректілер. Бірде-бір сүтқоректі бауырымен жорғалаушы емес. Қай қорытынды дұрыс?",
    },
    choices: [
      { en: "Some cats are reptiles", kz: "Кейбір мысықтар — бауырымен жорғалаушы" },
      { en: "No cats are reptiles", kz: "Бірде-бір мысық бауырымен жорғалаушы емес" },
      { en: "All mammals are cats", kz: "Барлық сүтқоректілер — мысық" },
      { en: "Some reptiles are cats", kz: "Кейбір бауырымен жорғалаушылар — мысық" },
    ],
    correctIndex: 1,
  },
  {
    prompt: {
      en: "Ice-cream sales and drowning deaths rise and fall together over the year. What is the best explanation?",
      kz: "Балмұздақ сатылымы мен суға кету оқиғалары жыл бойы бірге өсіп, бірге азаяды. Ең дұрыс түсіндірме қандай?",
    },
    choices: [
      { en: "Ice cream causes drowning", kz: "Балмұздақ суға кетуге себеп болады" },
      {
        en: "Drowning drives ice-cream sales",
        kz: "Суға кету балмұздақ сатылымын арттырады",
      },
      {
        en: "A third factor — hot weather — drives both",
        kz: "Үшінші фактор — ыстық ауа райы — екеуіне де әсер етеді",
      },
      { en: "It is pure coincidence", kz: "Бұл — таза кездейсоқтық" },
    ],
    correctIndex: 2,
  },
];

// Per-question hero emojis, index-aligned to each bank above.
const EASY_ICONS = [
  "🏙️", "🌐", "🌍", "🖥️", "🪐", "🌊", "🔷", "🌱", // general knowledge
  "🔢", "🔢", "🤔", "⚖️", "⚾", "📅", "📆", "➗", "⚖️", "🗓️", "🐑", // logic
];
const MEDIUM_ICONS = [
  "🔢", "🔢", "🐱", "🕒", "🧩", "🧮", "🐻", "🚪", "🔢", "🐌",
  "🔢", "🚆", "🔢", "🏃", "➖", "🎲", "💰", "🔢", "🔢", "👨‍👧",
];
const HARD_ICONS = [
  "🛡️", "📦", "🧪", "💡", "🎂", "🎩", "⚖️", "🎣", "🧑‍🏫", "📷",
  "🪙", "🚪", "🌧️", "💍", "🎱", "🏁", "🧊", "📊", "🐱", "🍦",
];

const FALLBACK_ICON: Record<Difficulty, string> = {
  easy: "❓",
  medium: "🧩",
  hard: "🧠",
};

function withIcons(
  raw: RawQuestion[],
  icons: string[],
  difficulty: Difficulty,
): RawQuestion[] {
  return raw.map((q, i) => ({
    ...q,
    icon: q.icon ?? icons[i] ?? FALLBACK_ICON[difficulty],
  }));
}

export const EASY_BANK = withIcons(EASY_BANK_RAW, EASY_ICONS, "easy");
export const MEDIUM_BANK = withIcons(MEDIUM_BANK_RAW, MEDIUM_ICONS, "medium");
export const HARD_BANK = withIcons(HARD_BANK_RAW, HARD_ICONS, "hard");

export const BANKS: Record<Difficulty, RawQuestion[]> = {
  easy: EASY_BANK,
  medium: MEDIUM_BANK,
  hard: HARD_BANK,
};

export const DEFAULT_TIME_LIMIT: Record<Difficulty, number> = {
  easy: EASY_TIME_LIMIT,
  medium: MEDIUM_TIME_LIMIT,
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
      points: q.points ?? 100,
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
        icon: r.icon ?? undefined,
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
