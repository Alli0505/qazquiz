import { questionSchema } from "@qazquiz/types";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { quizzes, questions } from "@qazquiz/db";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const quizRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.db.query.quizzes.findMany({
        where: input?.category
          ? and(
              eq(quizzes.isPublished, true),
              eq(quizzes.category, input.category),
            )
          : eq(quizzes.isPublished, true),
        orderBy: (q, { desc }) => [desc(q.createdAt)],
        limit: 50,
      });
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const quiz = await ctx.db.query.quizzes.findFirst({
        where: eq(quizzes.id, input.id),
        with: { questions: { orderBy: (q, { asc }) => [asc(q.order)] } },
      });
      if (!quiz) throw new TRPCError({ code: "NOT_FOUND" });
      return quiz;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(120),
        description: z.string().max(500).optional(),
        category: z.string().optional(),
        questions: z.array(questionSchema.omit({ id: true, quizId: true })),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [quiz] = await ctx.db
        .insert(quizzes)
        .values({
          ownerId: ctx.session.userId,
          title: input.title,
          description: input.description,
          category: input.category,
        })
        .returning();

      if (!quiz) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      if (input.questions.length > 0) {
        await ctx.db.insert(questions).values(
          input.questions.map((q, i) => ({
            quizId: quiz.id,
            order: i,
            prompt: q.prompt,
            choices: q.choices,
            correctIndex: q.correctIndex,
            timeLimit: q.timeLimit,
            points: q.points,
          })),
        );
      }

      return quiz;
    }),
});
