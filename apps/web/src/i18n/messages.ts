export const LOCALES = ["en", "kz"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  kz: "ҚАЗ",
};

/**
 * UI string dictionary. `en` is the source of truth; every other locale
 * must satisfy the same shape (enforced by the `Messages` type below).
 *
 * Interpolation: use {name} placeholders, filled by the `t()` helper.
 */
const en = {
  home: {
    tagline: "Real-time multiplayer quiz battles.",
    subtitle: "Create a room, share the code, play live.",
    join: "Join a game",
    host: "Host a quiz",
    leaderboard: "View global leaderboard →",
  },
  host: {
    title: "Host a quiz",
    namePlaceholder: "Your name",
    create: "Create room",
    creating: "Creating…",
    hint: "You'll get a 5-letter code to share. Demo quiz is preloaded.",
    difficulty: "Difficulty",
    easy: "Easy",
    hard: "Hard",
    easyHint: "General knowledge · 15s per question",
    hardHint: "Tough logic & abstract puzzles · 2 min per question",
  },
  play: {
    title: "Join a game",
    codePlaceholder: "Game code",
    namePlaceholder: "Your name",
    join: "Join",
    joining: "Joining…",
    error: "Could not join",
  },
  lobby: {
    joinCode: "Join code",
    players_one: "{n} player in lobby",
    players_other: "{n} players in lobby",
    start: "Start game",
    waiting: "Waiting for the host to start…",
    go: "Go!",
  },
  game: {
    question: "Question {index} / {total}",
    locked: "Answer locked in ✓",
  },
  reveal: {
    correct: "Correct answer",
    standings: "Standings",
  },
  over: {
    label: "Game over",
    title: "🏆 Final results",
    you: "You finished #{rank} with {score} pts",
  },
  leaderboard: {
    title: "Global leaderboard",
    desc: "All-time rankings persist to Postgres once a database is connected. For the MVP, live in-game standings appear at the end of each match.",
    back: "Back home",
  },
  common: {
    home: "Home",
    mute: "Mute",
    unmute: "Unmute",
    language: "Language",
  },
};

export type Messages = typeof en;

const kz: Messages = {
  home: {
    tagline: "Нақты уақыттағы көпойыншылы викторина сайыстары.",
    subtitle: "Бөлме құрыңыз, кодпен бөлісіңіз, тікелей ойнаңыз.",
    join: "Ойынға қосылу",
    host: "Викторина өткізу",
    leaderboard: "Жаһандық рейтингті көру →",
  },
  host: {
    title: "Викторина өткізу",
    namePlaceholder: "Атыңыз",
    create: "Бөлме құру",
    creating: "Құрылуда…",
    hint: "Бөлісу үшін 5 әріптік код аласыз. Демо викторина дайын тұр.",
    difficulty: "Деңгей",
    easy: "Оңай",
    hard: "Қиын",
    easyHint: "Жалпы білім · әр сұраққа 15 сек",
    hardHint: "Күрделі логика және абстракция · әр сұраққа 2 мин",
  },
  play: {
    title: "Ойынға қосылу",
    codePlaceholder: "Ойын коды",
    namePlaceholder: "Атыңыз",
    join: "Қосылу",
    joining: "Қосылуда…",
    error: "Қосылу мүмкін болмады",
  },
  lobby: {
    joinCode: "Қосылу коды",
    players_one: "Лоббиде {n} ойыншы",
    players_other: "Лоббиде {n} ойыншы",
    start: "Ойынды бастау",
    waiting: "Жүргізушінің бастауын күтудеміз…",
    go: "Алға!",
  },
  game: {
    question: "{index} / {total} сұрақ",
    locked: "Жауап бекітілді ✓",
  },
  reveal: {
    correct: "Дұрыс жауап",
    standings: "Рейтинг",
  },
  over: {
    label: "Ойын аяқталды",
    title: "🏆 Қорытынды нәтижелер",
    you: "Сіз {rank}-орынды {score} ұпаймен аяқтадыңыз",
  },
  leaderboard: {
    title: "Жаһандық рейтинг",
    desc: "Дерекқор қосылған соң барлық уақыттағы рейтинг Postgres-те сақталады. MVP нұсқасында әр матч соңында тікелей нәтижелер көрсетіледі.",
    back: "Басты бетке",
  },
  common: {
    home: "Басты бет",
    mute: "Дыбысты өшіру",
    unmute: "Дыбысты қосу",
    language: "Тіл",
  },
};

export const messages: Record<Locale, Messages> = { en, kz };
