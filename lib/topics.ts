import { createServerSupabaseClient } from "@/lib/supabase_server";
import { fallbackBySlug, fallbackTopics } from "@/lib/topicCatalog";

export type TopicRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_key?: string | null;
  is_active?: boolean | null;
  sort_order?: number | null;
};

function buildFallbackTopic(slug: string): TopicRecord | null {
  const fallback = fallbackBySlug(slug);
  if (!fallback) return null;

  return {
    id: slug,
    name: fallback.title,
    slug: fallback.slug,
    description: fallback.description,
    icon_key: fallback.iconKey,
    is_active: true,
    sort_order: 100,
  };
}

export async function getTopicBySlug(slug: string): Promise<TopicRecord | null> {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from("topics")
    .select("id, name, slug, description, icon_key, is_active, sort_order")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (data) {
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description ?? "",
      icon_key: data.icon_key,
      is_active: data.is_active,
      sort_order: data.sort_order,
    };
  }

  return buildFallbackTopic(slug);
}

export async function getActiveTopics(): Promise<TopicRecord[]> {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from("topics")
    .select("id, name, slug, description, icon_key, is_active, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (!data || data.length === 0) {
    return fallbackTopics.map((topic, index) => ({
      id: topic.slug,
      name: topic.title,
      slug: topic.slug,
      description: topic.description,
      icon_key: topic.iconKey,
      is_active: true,
      sort_order: index,
    }));
  }

  return data.map((topic) => ({
    id: topic.id,
    name: topic.name,
    slug: topic.slug,
    description: topic.description ?? "",
    icon_key: topic.icon_key,
    is_active: topic.is_active,
    sort_order: topic.sort_order,
  }));
}

export async function getTopicSlugById(topicId: string): Promise<string | null> {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from("topics")
    .select("slug")
    .eq("id", topicId)
    .maybeSingle();

  return data?.slug ?? null;
}
