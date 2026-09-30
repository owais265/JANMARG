import { createFileRoute } from "@tanstack/react-router";
import { FeedbackPage } from "@/components/beta/pages";

export const Route = createFileRoute("/feedback")({ component: FeedbackPage });
