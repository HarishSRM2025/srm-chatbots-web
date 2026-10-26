import Widget from "./widget";
export default async function Page({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;
  return <Widget agentId={agentId} />;
}
