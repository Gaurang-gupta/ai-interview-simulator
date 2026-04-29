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
const DEFAULT_TRACK = "general";

type QuestionItem = {
  question: string;
  answer: string;
  feedback: string;
  score: number;
};

type AttemptConceptScore = {
  concept: string;
  score: number;
};

type AttemptQaScore = {
  question: string;
  score: number;
  rubric?: {
    correctness?: number;
    depth?: number;
    clarity?: number;
    tradeoff_awareness?: number;
  };
};

export async function generateQuestions(topicSlug: string, level: string, track: string = DEFAULT_TRACK) {
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
    .select("score, report_json, qa_json")
    .eq("user_id", user.id)
    .eq("topic_id", topic.id)
    .eq("level", parsedLevel.data)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const weakConcepts =
    latestAttempt?.report_json?.concept_scores
      ?.filter((concept: AttemptConceptScore) => concept.score < 75)
      ?.map((concept: AttemptConceptScore) => concept.concept)
      ?.slice(0, 4) ?? [];

  const weakestPreviousQuestions =
    (latestAttempt?.qa_json as AttemptQaScore[] | undefined)
      ?.slice()
      ?.sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
      ?.slice(0, 2)
      ?.map((item) => item.question)
      ?.filter(Boolean) ?? [];

  const weakRubricDimensions = (() => {
    const rubricTotals = {
      correctness: 0,
      depth: 0,
      clarity: 0,
      tradeoff_awareness: 0,
    };
    let count = 0;

    ((latestAttempt?.qa_json as AttemptQaScore[] | undefined) ?? []).forEach((item) => {
      if (!item.rubric) return;
      rubricTotals.correctness += item.rubric.correctness ?? 0;
      rubricTotals.depth += item.rubric.depth ?? 0;
      rubricTotals.clarity += item.rubric.clarity ?? 0;
      rubricTotals.tradeoff_awareness += item.rubric.tradeoff_awareness ?? 0;
      count += 1;
    });

    if (count === 0) return [] as string[];

    return Object.entries(rubricTotals)
      .map(([dimension, total]) => ({
        dimension,
        avg: Math.round(total / count),
      }))
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 2)
      .map((entry) => entry.dimension);
  })();

  const adaptationContext =
    latestAttempt && weakConcepts.length > 0
      ? `\nUser context: Previous score at this level was ${latestAttempt.score ?? 0}. Focus extra questions on these weaker concepts: ${weakConcepts.join(", ")}.`
      : "\nUser context: No prior weak-concept history at this level. Generate broad coverage questions.";

  const followUpContext =
    weakestPreviousQuestions.length > 0
      ? `\nAdaptive follow-up requirement: Include at least 2 questions that are direct follow-ups to mistakes similar to these previous low-scoring prompts:\n- ${weakestPreviousQuestions.join("\n- ")}`
      : "";

  const rubricFocusContext =
    weakRubricDimensions.length > 0
      ? `\nAdaptive quality requirement: Prioritize question styles that improve these weak rubric dimensions: ${weakRubricDimensions.join(", ")}.`
      : "";

  const weakestConceptSimulatorContext =
    track === "weakest-concept"
      ? "\nMode: Weakest Concept Simulator. At least 7/10 questions must specifically target the user's weakest concepts and common errors."
      : "";

  logger.info("Generating interview questions", {
    topicSlug,
    topicId: topic.id,
    level: parsedLevel.data,
    track,
    userId: user.id,
  });

  const { object } = await generateObject({
    model: google(QUESTION_MODEL),
    schema: QuestionSchema,
    prompt: `
Generate exactly 10 high-quality interview questions.

Topic: ${topic.name}
Level: ${parsedLevel.data}
Role Track: ${track}

Rules:
- Questions should test real understanding
- No explanations
- No repetition
- Include scenario-style questions that require tradeoff reasoning
- Increase practical depth if prior performance was strong
- Tailor wording and examples to the selected role track
${adaptationContext}
${followUpContext}
${rubricFocusContext}
${weakestConceptSimulatorContext}
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
          track,
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
      track,
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
