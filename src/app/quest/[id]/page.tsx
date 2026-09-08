import { notFound } from "next/navigation";
import QuestDetail from "@/components/QuestDetail";
import { QUEST_BY_ID, QUESTS } from "@/lib/quests";

export function generateStaticParams() {
  return QUESTS.map((q) => ({ id: q.id }));
}

export default async function QuestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!QUEST_BY_ID.has(id)) notFound();
  return <QuestDetail id={id} />;
}
