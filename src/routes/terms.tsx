import { createFileRoute } from "@tanstack/react-router";
import { TermsPage } from "@/components/beta/pages";

export const Route = createFileRoute("/terms")({ component: TermsPage });
