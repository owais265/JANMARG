import { createFileRoute } from "@tanstack/react-router";
import { TrackIndex } from "@/components/beta/module-pages";
import { Guard } from "@/components/beta/pages";
import { Shell } from "@/components/beta/shell";

function Page() {
  return (
    <Guard>
      <Shell>
        <TrackIndex />
      </Shell>
    </Guard>
  );
}

export const Route = createFileRoute("/applications/")({ component: Page });
