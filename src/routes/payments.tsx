import { createFileRoute } from "@tanstack/react-router";
import { PaymentsView } from "@/components/beta/module-pages";
import { Guard } from "@/components/beta/pages";
import { Shell } from "@/components/beta/shell";

function Page() {
  return (
    <Guard>
      <Shell>
        <PaymentsView />
      </Shell>
    </Guard>
  );
}

export const Route = createFileRoute("/payments")({ component: Page });
