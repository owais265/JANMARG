import { createFileRoute } from "@tanstack/react-router";
import { ConnectPage } from "@/components/beta/connect-page";

export const Route = createFileRoute("/connect")({ component: ConnectPage });
