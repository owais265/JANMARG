import { createFileRoute } from "@tanstack/react-router";
import { AlertsView } from "@/components/beta/module-pages";
import { Guard } from "@/components/beta/pages";
import { Shell } from "@/components/beta/shell";

function Page() {
  return (
    <Guard>
      <Shell>
        <AlertsView />
      </Shell>
    </Guard>
  );
}

export const Route = createFileRoute("/notifications")({ component: Page });
