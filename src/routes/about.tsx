import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/components/beta/pages";

export const Route = createFileRoute("/about")({ component: AboutPage });
