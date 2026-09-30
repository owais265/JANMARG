import type { ApplicationStatus } from "./types.ts";

export const FILE_STAGES = ["submission", "verification", "sanction", "disbursement"] as const;
export type FileStage = (typeof FILE_STAGES)[number];
export type StageMark = "done" | "now" | "later" | "stopped";

const AT: Record<ApplicationStatus, number> = {
  draft: -1,
  submitted: 0,
  instituteVerification: 1,
  stateVerification: 1,
  ministryReview: 1,
  sanctioned: 2,
  disbursed: 3,
  returned: 1,
  rejected: 1,
};

export function stageMarks(status: ApplicationStatus): Record<FileStage, StageMark> {
  const index = AT[status];
  const stopped = status === "returned" || status === "rejected";
  const marks = {} as Record<FileStage, StageMark>;
  FILE_STAGES.forEach((stage, position) => {
    if (position < index) marks[stage] = "done";
    else if (position === index) marks[stage] = stopped ? "stopped" : status === "disbursed" ? "done" : "now";
    else marks[stage] = "later";
  });
  return marks;
}
