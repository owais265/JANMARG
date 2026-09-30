import { createFileRoute } from "@tanstack/react-router";
import { DeletePage } from "@/components/beta/pages";

export const Route = createFileRoute("/account/delete")({ component: DeletePage });
