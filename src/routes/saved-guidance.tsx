import { createFileRoute } from "@tanstack/react-router";
import { SavedPage } from "@/components/beta/pages";

export const Route = createFileRoute("/saved-guidance")({ component: SavedPage });
