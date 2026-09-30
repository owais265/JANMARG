import { createFileRoute } from "@tanstack/react-router";
import { SupportPage } from "@/components/beta/pages";

export const Route = createFileRoute("/support")({ component: SupportPage });
