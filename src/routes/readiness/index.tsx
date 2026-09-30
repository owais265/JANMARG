import { createFileRoute } from "@tanstack/react-router";
import { ReadinessIndex } from "@/components/beta/pages";

export const Route = createFileRoute("/readiness/")({ component: ReadinessIndex });
