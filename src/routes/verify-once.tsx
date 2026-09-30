import { createFileRoute } from "@tanstack/react-router";
import { VerifyOnceView } from "@/components/beta/module-pages";
import { Guard } from "@/components/beta/pages";
import { Shell } from "@/components/beta/shell";

function Page() {
  return (
    <Guard>
      <Shell>
        <VerifyOnceView />
      </Shell>
    </Guard>
  );
}

export const Route = createFileRoute("/verify-once")({ component: Page });
