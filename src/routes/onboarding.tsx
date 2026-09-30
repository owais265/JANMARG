import { createFileRoute } from "@tanstack/react-router";
import { OnboardingPage } from "@/components/beta/pages";

export const Route = createFileRoute("/onboarding")({ component: OnboardingPage });
