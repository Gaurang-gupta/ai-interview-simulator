"use server";

import { createServerSupabaseClient } from "@/lib/supabase_server";
import { getCurrentUser } from "@/lib/auth";
import { google } from "@/lib/ai";
import { generateObject } from "ai";
import { QuestionSchema } from "@/lib/zodSchemas";
import { getTopicBySlug } from "@/lib/topics";

export async function generateQuestions(topicSlug: string, level: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const supabase = await createServerSupabaseClient();

    // ✅ DIRECT MAPPING (NO DB LOOKUP)
    const topic = getTopicBySlug(topicSlug);
    if (!topic) throw new Error("Invalid topic");

    const { object } = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: QuestionSchema,
        prompt: `
Generate exactly 10 high-quality interview questions.

Topic: ${topic.title}
Level: ${level}

Rules:
- Questions should test real understanding
- No explanations
- No repetition
`,
    });

    const questions = object.questions;

    const { data, error } = await supabase
        .from("attempts")
        .insert({
            user_id: user.id,
            topic_id: topic.id, // ✅ correct usage
            level,
            status: "in_progress",
            qa_json: questions.map((q) => ({
                question: q,
                answer: "",
                feedback: "",
                score: 0,
            })),
        })
        .select()
        .single();

    if (error) throw error;

    return {
        attemptId: data.id,
        questions,
    };
}