import { createFileRoute } from "@tanstack/react-router";
import { WalletIndex } from "@/components/beta/module-pages";
import { Guard } from "@/components/beta/pages";
import { Shell } from "@/components/beta/shell";

function Page() {
  return (
    <Guard>
      <Shell>
        <WalletIndex />
      </Shell>
    </Guard>
  );
}

export const Route = createFileRoute("/documents/")({ component: Page });
