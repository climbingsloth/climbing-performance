import PlanningDetailClient from "./planning-detail-client";

export default async function PlanningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PlanningDetailClient planningId={id} />;
}
