import { createFileRoute } from "@tanstack/react-router";
import { SchemesPage } from "@/components/beta/pages";

export const Route = createFileRoute("/schemes/")({ component: SchemesPage });
