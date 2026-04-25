"use server";

import { createServerSupabaseClient } from "@/lib/supabase_server";
import { getCurrentUser } from "@/lib/auth";
import { getTopicBySlug } from "@/lib/topics";

export async function getLevelStatus(topicSlug: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const supabase = await createServerSupabaseClient();

    // ✅ DIRECT MAPPING (NO DB LOOKUP)
    const topic = getTopicBySlug(topicSlug);
    if (!topic) throw new Error("Invalid topic");

    const { data, error } = await supabase
        .from("attempts")
        .select("*")
        .eq("user_id", user.id)
        .eq("topic_id", topic.id)
        .order("created_at", { ascending: false });

    if (error) throw error;

    const getLatestScore = (level: string) => {
        const attempt = data.find((a: any) => a.level === level);
        return attempt?.score || 0;
    };

    const beginnerScore = getLatestScore("beginner");
    const intermediateScore = getLatestScore("intermediate");

    return {
        beginner: true,
        intermediate: beginnerScore >= 90,
        advanced: intermediateScore >= 90,
        scores: {
            beginner: beginnerScore,
            intermediate: intermediateScore,
        },
    };
}