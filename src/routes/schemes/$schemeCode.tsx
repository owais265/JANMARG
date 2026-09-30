import { createFileRoute } from "@tanstack/react-router";
import { SchemePage } from "@/components/beta/pages";

export const Route = createFileRoute("/schemes/$schemeCode")({ component: SchemePage });
