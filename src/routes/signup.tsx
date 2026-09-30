import { createFileRoute } from "@tanstack/react-router";
import { SignupPage } from "@/components/beta/pages";

export const Route = createFileRoute("/signup")({ component: SignupPage });
