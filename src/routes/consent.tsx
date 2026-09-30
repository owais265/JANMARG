import { createFileRoute } from "@tanstack/react-router";
import { ConsentPage } from "@/components/beta/pages";

export const Route = createFileRoute("/consent")({ component: ConsentPage });
