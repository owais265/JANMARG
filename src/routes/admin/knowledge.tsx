import { createFileRoute } from "@tanstack/react-router";
import { AdminClosed } from "@/components/beta/pages";

export const Route = createFileRoute("/admin/knowledge")({ component: AdminClosed });
