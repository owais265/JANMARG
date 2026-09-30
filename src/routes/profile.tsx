import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/beta/pages";

export const Route = createFileRoute("/profile")({ component: ProfilePage });
