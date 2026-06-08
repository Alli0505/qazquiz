-- QazQuiz schema — owned by the Kotlin backend via Flyway.
-- (Previously managed by Drizzle on the Node side; migrated here so the
--  backend is the single owner of the database.)

CREATE TYPE difficulty AS ENUM ('easy', 'medium', 'hard');

CREATE TABLE users (
    id             text PRIMARY KEY,
    name           text NOT NULL,
    email          text NOT NULL UNIQUE,
    email_verified boolean NOT NULL DEFAULT false,
    image          text,
    created_at     timestamp NOT NULL DEFAULT now(),
    updated_at     timestamp NOT NULL DEFAULT now()
);

CREATE TABLE quizzes (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id     text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title        text NOT NULL,
    description  text,
    category     text,
    is_published boolean NOT NULL DEFAULT false,
    created_at   timestamp NOT NULL DEFAULT now()
);

CREATE TABLE questions (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id       uuid REFERENCES quizzes(id) ON DELETE CASCADE,
    difficulty    difficulty NOT NULL DEFAULT 'easy',
    category      text,
    "order"       integer,
    prompt        jsonb NOT NULL,
    choices       jsonb NOT NULL,
    correct_index smallint NOT NULL,
    icon          text,
    explanation   jsonb,
    time_limit    integer NOT NULL DEFAULT 15,
    points        integer NOT NULL DEFAULT 100,
    is_active     boolean NOT NULL DEFAULT true,
    created_at    timestamp NOT NULL DEFAULT now()
);
CREATE INDEX questions_difficulty_idx ON questions (difficulty, is_active);
CREATE INDEX questions_quiz_idx ON questions (quiz_id);

CREATE TABLE games (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id    uuid REFERENCES quizzes(id) ON DELETE RESTRICT,
    difficulty difficulty,
    host_id    text REFERENCES users(id) ON DELETE SET NULL,
    code       text NOT NULL UNIQUE,
    started_at timestamp,
    ended_at   timestamp,
    created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX games_code_idx ON games (code);

CREATE TABLE game_results (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id      uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id      text REFERENCES users(id) ON DELETE SET NULL,
    display_name text NOT NULL,
    final_score  integer NOT NULL,
    rank         integer NOT NULL
);
CREATE INDEX game_results_game_idx ON game_results (game_id);
