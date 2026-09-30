import type { ActionId, SchemeId } from "./types.ts";
import { schemeSlug } from "./rules.ts";

export function hrefFor(action: ActionId, schemeId: SchemeId, applicationId?: string): string {
  switch (action) {
    case "renewIncome":
      return "/documents";
    case "fixName":
    case "manualReview":
      return "/verification";
    case "addOffer":
    case "addPassport":
    case "readiness":
    case "seeWhy":
    case "retry":
      return `/eligibility/${schemeSlug(schemeId)}`;
    case "openWizard":
    case "resumeDraft":
      return `/apply/${schemeSlug(schemeId)}`;
    case "infoOnly":
      return `/schemes/${schemeSlug(schemeId)}`;
    case "viewJourney":
      return applicationId ? `/journey/${applicationId}` : "/home";
    default:
      return "/home";
  }
}
