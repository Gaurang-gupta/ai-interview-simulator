"use server";

import { getActiveTopics } from "@/lib/topics";

export async function getTopics() {
  return getActiveTopics();
}
