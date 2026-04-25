"use server";

import { createServerSupabaseClient } from "@/lib/supabase_server";
import { getCurrentUser } from "@/lib/auth";
import { google } from "@/lib/ai";
import { generateObject } from "ai";
import { AnswersSchema, EvaluationSchema } from "@/lib/zodSchemas";
import { createRequestLogger } from "@/lib/logger";

const EVALUATION_MODEL = "gemini-2.5-flash";
const EVALUATION_PROMPT_VERSION = "v1";

type AttemptQuestionRow = {
  question: string;
};

type AttemptRecord = {
  id: string;
  user_id: string;
  created_at: string;
  qa_json: AttemptQuestionRow[];
};

export async function submitAnswers(attemptId: string, answers: string[]) {
  const logger = createRequestLogger("submitAnswers");
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const parsedAnswers = AnswersSchema.safeParse(answers);
  if (!parsedAnswers.success) {
    throw new Error(parsedAnswers.error.issues[0]?.message ?? "Invalid answers");
  }

  const supabase = await createServerSupabaseClient();

  const { data: attempt, error: fetchError } = await supabase
    .from("attempts")
    .select("id, user_id, created_at, qa_json")
    .eq("id", attemptId)
    .single();

  if (fetchError) throw fetchError;

  const typedAttempt = attempt as AttemptRecord;

  if (typedAttempt.user_id !== user.id) {
    throw new Error("Forbidden");
  }

  const questions = typedAttempt.qa_json.map((row) => row.question);

  const { object } = await generateObject({
    model: google(EVALUATION_MODEL),
    schema: EvaluationSchema,
    prompt: `
Evaluate the following interview answers.

Questions:
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Answers:
${parsedAnswers.data.map((a, i) => `${i + 1}. ${a}`).join("\n")}

Rules:
- Score each answer out of 100
- Reward correctness and conceptual depth
- Penalize vague or incorrect statements
`,
  });

  const now = new Date();
  const started = new Date(typedAttempt.created_at);
  const durationSeconds = Math.max(0, Math.round((now.getTime() - started.getTime()) / 1000));

  const analyticsEvents = [
    {
      name: "attempt_submitted",
      timestamp: now.toISOString(),
      request_id: logger.requestId,
      duration_seconds: durationSeconds,
    },
  ];

  const { error: updateError } = await supabase
    .from("attempts")
    .update({
      status: "completed",
      score: Math.round(object.score),
      completed_at: now.toISOString(),
      duration_seconds: durationSeconds,
      model_name: EVALUATION_MODEL,
      prompt_version: EVALUATION_PROMPT_VERSION,
      report_json: {
        strengths: object.strengths,
        weaknesses: object.weaknesses,
        improvement_plan: object.improvement_plan,
        concept_scores: object.concept_scores,
      },
      qa_json: object.qa_feedback,
      analytics_json: {
        events: analyticsEvents,
      },
    })
    .eq("id", attemptId);

  if (updateError) throw updateError;

  const { error: eventError } = await supabase.from("attempt_events").insert({
    attempt_id: attemptId,
    user_id: user.id,
    event_name: "attempt_completed",
    payload: {
      request_id: logger.requestId,
      duration_seconds: durationSeconds,
      score: Math.round(object.score),
    },
  });

  if (eventError) {
    logger.warn("Failed to persist attempt_completed event", { error: eventError.message });
  }

  return object;
}
