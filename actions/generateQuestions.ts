"use server";

import { createServerSupabaseClient } from "@/lib/supabase_server";
import { getCurrentUser } from "@/lib/auth";
import { google } from "@/lib/ai";
import { generateObject } from "ai";
import { LevelSchema, QuestionSchema } from "@/lib/zodSchemas";
import { getTopicBySlug } from "@/lib/topics";
import { createRequestLogger } from "@/lib/logger";

const QUESTION_MODEL = "gemini-2.5-flash";
const QUESTION_PROMPT_VERSION = "v1";

type QuestionItem = {
  question: string;
  answer: string;
  feedback: string;
  score: number;
};

export async function generateQuestions(topicSlug: string, level: string) {
  const logger = createRequestLogger("generateQuestions");
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const parsedLevel = LevelSchema.safeParse(level);
  if (!parsedLevel.success) {
    throw new Error("Invalid level");
  }

  const supabase = await createServerSupabaseClient();
  const topic = await getTopicBySlug(topicSlug);
  if (!topic) throw new Error("Invalid topic");

  const { data: latestAttempt } = await supabase
    .from("attempts")
    .select("score, report_json")
    .eq("user_id", user.id)
    .eq("topic_id", topic.id)
    .eq("level", parsedLevel.data)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const weakConcepts =
    latestAttempt?.report_json?.concept_scores
      ?.filter((concept: { concept: string; score: number }) => concept.score < 75)
      ?.map((concept: { concept: string }) => concept.concept)
      ?.slice(0, 4) ?? [];

  const adaptationContext =
    latestAttempt && weakConcepts.length > 0
      ? `\nUser context: Previous score at this level was ${latestAttempt.score ?? 0}. Focus extra questions on these weaker concepts: ${weakConcepts.join(", ")}.`
      : "\nUser context: No prior weak-concept history at this level. Generate broad coverage questions.";

  logger.info("Generating interview questions", {
    topicSlug,
    topicId: topic.id,
    level: parsedLevel.data,
    userId: user.id,
  });

  const { object } = await generateObject({
    model: google(QUESTION_MODEL),
    schema: QuestionSchema,
    prompt: `
Generate exactly 10 high-quality interview questions.

Topic: ${topic.name}
Level: ${parsedLevel.data}

Rules:
- Questions should test real understanding
- No explanations
- No repetition
- Include scenario-style questions that require tradeoff reasoning
- Increase practical depth if prior performance was strong
${adaptationContext}
`,
  });

  const questions = object.questions;

  const payload = {
    user_id: user.id,
    topic_id: topic.id,
    topic_slug_snapshot: topic.slug,
    level: parsedLevel.data,
    status: "in_progress",
    prompt_version: QUESTION_PROMPT_VERSION,
    model_name: QUESTION_MODEL,
    qa_json: questions.map(
      (question): QuestionItem => ({
        question,
        answer: "",
        feedback: "",
        score: 0,
      }),
    ),
    analytics_json: {
      events: [
        {
          name: "attempt_started",
          timestamp: new Date().toISOString(),
          request_id: logger.requestId,
        },
      ],
    },
  };

  let { data, error } = await supabase.from("attempts").insert(payload).select("id").single();

  if (error?.code === "42703") {
    ({ data, error } = await supabase
      .from("attempts")
      .insert({
        user_id: user.id,
        topic_id: topic.id,
        level: parsedLevel.data,
        status: "in_progress",
        qa_json: payload.qa_json,
      })
      .select("id")
      .single());
  }

  if (error) throw error;
  if (!data?.id) throw new Error("Failed to create attempt");

  const attemptId = data.id;

  const { error: eventError } = await supabase.from("attempt_events").insert({
    attempt_id: attemptId,
    user_id: user.id,
    event_name: "attempt_started",
    payload: {
      topic_slug: topic.slug,
      level: parsedLevel.data,
      request_id: logger.requestId,
    },
  });

  if (eventError) {
    logger.warn("Failed to persist attempt_started event", { error: eventError.message });
  }

  return {
    attemptId,
    questions,
  };
}
