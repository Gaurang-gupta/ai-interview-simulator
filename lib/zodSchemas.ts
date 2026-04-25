import { z } from "zod";

export const LevelSchema = z.enum(["beginner", "intermediate", "advanced"]);

export const QuestionSchema = z.object({
  questions: z.array(z.string()).length(10),
});

export const AnswerSchema = z
  .string()
  .trim()
  .min(20, "Each answer should be at least 20 characters long.");

export const AnswersSchema = z.array(AnswerSchema).length(10);

export const EvaluationSchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  improvement_plan: z.array(z.string()),
  concept_scores: z.array(
    z.object({
      concept: z.string(),
      score: z.number().min(0).max(100),
    }),
  ),
  qa_feedback: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
        feedback: z.string(),
        score: z.number().min(0).max(100),
      }),
    )
    .length(10),
});
