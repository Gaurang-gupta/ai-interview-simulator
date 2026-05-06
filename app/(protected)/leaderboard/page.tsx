import { createServerSupabaseClient } from "@/lib/supabase_server";
import LeaderboardClient from "./LeaderboardClient";
import { createAdminSupabaseClient } from "@/lib/supabase_admin";
import { getCurrentUser } from "@/lib/auth";

export default async function LeaderboardPage() {
  const supabase = await createServerSupabaseClient();
  const adminClient = await createAdminSupabaseClient();
  const user = await getCurrentUser();

  // 1. Fetch Topics for dropdown
  const { data: topicsData } = await supabase
    .from("topics")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // 2. Fetch Attempts
  const { data: attempts, error: attemptsError } = await supabase
    .from("attempts")
    .select(
      `
      id,
      score,
      duration_seconds,
      level,
      created_at,
      user_id,
      topics ( name )
    `,
    )
    .eq("status", "completed")
    .not("score", "is", null);

  // 3. Fetch User Emails (Using admin API to bridge the auth schema)
  // Note: This requires the service_role key configured in your server client
  const { data: authData, error: authError } =
    await adminClient.auth.admin.listUsers();

  const userMap = new Map(authData?.users.map((u) => [u.id, u.email]) || []);

  if (attemptsError) console.error("Attempts Fetch Error:", attemptsError);

  // 4. Sanitize and Join Data
  const sanitizedAttempts = (attempts || []).map((att: any) => ({
    id: att.id,
    userEmail: userMap.get(att.user_id) || "Anonymous",
    topicName: att.topics?.name || "General",
    level: att.level.toLowerCase(),
    score: att.score || 0,
    duration: att.duration_seconds || 0,
    date: att.created_at
      ? new Date(att.created_at).toLocaleDateString()
      : "N/A",
  }));

  const topicList = ["Overall", ...(topicsData?.map((t) => t.name) || [])];

  return (
    <LeaderboardClient
      initialData={sanitizedAttempts}
      topics={topicList}
      user={user?.email}
    />
  );
}
