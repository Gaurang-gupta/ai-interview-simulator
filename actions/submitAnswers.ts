"use server";

import { createServerSupabaseClient } from "@/lib/supabase_server";
import { getCurrentUser } from "@/lib/auth";
import { google } from "@/lib/ai";
import { generateObject } from "ai";
import { EvaluationSchema } from "@/lib/zodSchemas";

export async function submitAnswers(attemptId: string, answers: string[]) {
    try {
        console.log("submitAnswers called");
        console.log("attemptId:", attemptId);
        console.log("answers:", answers);

        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const supabase = await createServerSupabaseClient();

        const { data: attempt, error: fetchError } = await supabase
            .from("attempts")
            .select("*")
            .eq("id", attemptId)
            .single();

        if (fetchError) {
            console.error("Fetch error:", fetchError);
            throw fetchError;
        }

        if (attempt.user_id !== user.id) {
            throw new Error("Forbidden");
        }

        const questions = attempt.qa_json.map((q: any) => q.question);

        console.log("Calling AI...");

        const { object } = await generateObject({
            model: google("gemini-2.5-flash"),
            schema: EvaluationSchema,
            prompt: `
Evaluate the following interview answers.

Questions:
${questions.map((q: string, i: number) => `${i + 1}. ${q}`).join("\n")}

Answers:
${answers.map((a: string, i: number) => `${i + 1}. ${a}`).join("\n")}
score each answer out of 100
`,
        });

        console.log("AI result:", object);

        const { error: updateError } = await supabase
            .from("attempts")
            .update({
                status: "completed",
                score: Math.round(object.score),
                report_json: {
                    strengths: object.strengths,
                    weaknesses: object.weaknesses,
                    improvement_plan: object.improvement_plan,
                    concept_scores: object.concept_scores,
                },
                qa_json: object.qa_feedback,
            })
            .eq("id", attemptId);

        if (updateError) {
            console.error("Update error:", updateError);
            throw updateError;
        }

        return object;
    } catch (err) {
        console.error("SUBMIT ERROR:", err);
        throw err;
    }
}