import { createFileRoute } from "@tanstack/react-router";
import { ChecklistPage } from "@/components/beta/pages";

export const Route = createFileRoute("/checklist")({ component: ChecklistPage });
