import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/components/beta/pages";

export const Route = createFileRoute("/dashboard")({ component: DashboardPage });
