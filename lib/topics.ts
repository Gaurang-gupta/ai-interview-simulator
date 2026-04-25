import { topics } from "@/constants/topicList";

export function getTopicBySlug(slug: string) {
    return topics.find((t) => t.slug === slug);
}