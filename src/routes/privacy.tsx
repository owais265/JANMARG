import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/components/beta/pages";

export const Route = createFileRoute("/privacy")({ component: PrivacyPage });
