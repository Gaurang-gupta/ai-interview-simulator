import { createServerSupabaseClient } from "@/lib/supabase_server";
import { notFound } from "next/navigation";
import ReplayClientView from "@/components/ReplayClientView";

export default async function ReplayPage({
  params,
}: {
  params: { attemptId: string };
}) {
  const supabase = await createServerSupabaseClient();
  const { attemptId } = await params;

  const { data: attempt, error } = await supabase
    .from("attempts")
    .select(
      `
      *,
      topics (name)
    `,
    )
    .eq("id", attemptId)
    .single();

  if (error || !attempt) {
    notFound();
  }

  const { report_json, qa_json, topics, score, level } = attempt;

  return (
    <main className="min-h-screen bg-[#050505] text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <ReplayClientView
          attempt={{ report_json, qa_json, topics, score, level }}
        />
      </div>
    </main>
  );
}
