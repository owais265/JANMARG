import { createFileRoute } from "@tanstack/react-router";
import { JagoPage } from "@/components/beta/pages";

export const Route = createFileRoute("/jago")({ component: JagoPage });
