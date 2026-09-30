import { createFileRoute } from "@tanstack/react-router";
import { ClosedPage } from "@/components/beta/shell";

export const Route = createFileRoute("/applications/$applicationId/resolve")({ component: ClosedPage });
