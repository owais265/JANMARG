import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/beta/pages";

export const Route = createFileRoute("/")({ component: LandingPage });
