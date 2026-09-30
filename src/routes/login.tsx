import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/components/beta/pages";

export const Route = createFileRoute("/login")({ component: LoginPage });
