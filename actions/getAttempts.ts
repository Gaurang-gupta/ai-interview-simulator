"use server";

import { createServerSupabaseClient } from "@/lib/supabase_server";
import { getCurrentUser } from "@/lib/auth";

export async function getAttempts() {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("attempts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
}

export async function getAttemptsWithTopicNames() {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("attempts")
        .select(`
            *,
            topics ( name )
        `)
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
}
