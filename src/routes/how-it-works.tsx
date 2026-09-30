import { createFileRoute } from "@tanstack/react-router";
import { HowPage } from "@/components/beta/pages";

export const Route = createFileRoute("/how-it-works")({ component: HowPage });
