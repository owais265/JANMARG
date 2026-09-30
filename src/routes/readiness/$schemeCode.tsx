import { createFileRoute } from "@tanstack/react-router";
import { ReadinessPage } from "@/components/beta/pages";

export const Route = createFileRoute("/readiness/$schemeCode")({ component: ReadinessPage });
