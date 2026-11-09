import AthleteDetailClient from "./athlete-detail-client";

export default async function AthleteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AthleteDetailClient athleteId={id} />;
}
