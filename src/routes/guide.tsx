import { createFileRoute } from "@tanstack/react-router";
import { GuidePage } from "@/components/beta/guide-page";
import { Shell } from "@/components/beta/shell";

function GuideRoute() {
  return (
    <Shell>
      <GuidePage />
    </Shell>
  );
}

export const Route = createFileRoute("/guide")({ component: GuideRoute });
