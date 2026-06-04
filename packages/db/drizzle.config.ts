import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgres://qazquiz:qazquiz@localhost:5432/qazquiz",
  },
  verbose: true,
  strict: true,
});
