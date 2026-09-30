import { createFileRoute } from "@tanstack/react-router";
import { ApplicationView } from "@/components/beta/module-pages";
import { Guard } from "@/components/beta/pages";
import { Shell } from "@/components/beta/shell";

function Page() {
  return (
    <Guard>
      <Shell>
        <ApplicationView />
      </Shell>
    </Guard>
  );
}

export const Route = createFileRoute("/applications/$applicationId/")({ component: Page });
