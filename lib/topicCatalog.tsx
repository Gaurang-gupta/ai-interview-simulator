import { FaJava, FaJs, FaPython } from "react-icons/fa6";
import { Cpu, Database, Layout } from "lucide-react";
import { ReactNode } from "react";

export type TopicPresentation = {
  slug: string;
  title: string;
  description: string;
  iconKey: string;
};

export const fallbackTopics: TopicPresentation[] = [
  {
    slug: "databases",
    title: "Databases",
    description: "Master SQL, NoSQL, and schema design.",
    iconKey: "database",
  },
  {
    slug: "os",
    title: "Operating Systems",
    description: "Threads, memory, scheduling, and kernel architecture.",
    iconKey: "cpu",
  },
  {
    slug: "system-design",
    title: "System Design",
    description: "Scalability, reliability, and distributed architecture.",
    iconKey: "layout",
  },
  {
    slug: "java",
    title: "Java",
    description: "Object-oriented, JVM internals, and performance tuning.",
    iconKey: "java",
  },
  {
    slug: "javascript",
    title: "JavaScript",
    description: "Language fundamentals, async behavior, and runtime patterns.",
    iconKey: "javascript",
  },
  {
    slug: "python",
    title: "Python",
    description: "Readable syntax, data processing, and backend automation.",
    iconKey: "python",
  },
];

const iconByKey: Record<string, ReactNode> = {
  database: <Database className="text-emerald-400" />,
  cpu: <Cpu className="text-blue-400" />,
  layout: <Layout className="text-purple-400" />,
  java: <FaJava className="text-red-400 text-2xl" />,
  javascript: <FaJs className="text-yellow-400 text-2xl" />,
  python: <FaPython className="text-indigo-400 text-2xl" />,
};

export function getTopicIcon(iconKey?: string) {
  if (!iconKey) return <Database className="text-emerald-400" />;
  return iconByKey[iconKey] ?? <Database className="text-emerald-400" />;
}

export function fallbackBySlug(slug: string) {
  return fallbackTopics.find((topic) => topic.slug === slug);
}

export function inferSlugFromTopicName(name: string) {
  const normalized = name.trim().toLowerCase();
  const match = fallbackTopics.find((topic) => topic.title.toLowerCase() === normalized);
  return match?.slug;
}
