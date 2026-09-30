import { assessEligibility } from "./eligibility.ts";
import { reasonText } from "./present.ts";
import { hrefFor } from "./nav.ts";
import { primaryAction } from "./plan.ts";
import { SCHEMES } from "./rules.ts";
import { t } from "./copy.ts";
import type { AppData, Lang } from "./types.ts";

export type FileBrief = {
  brief: string;
  fallbackText: string;
  fallbackNext: string;
  fallbackHref: string;
};

export function fileBrief(data: AppData, lang: Lang, page: string): FileBrief {
  const id = data.personaId;
  const profile = id ? data.profiles[id] : undefined;
  if (!id || !profile) {
    return {
      brief: `Screen: ${page}. No student file is open.`,
      fallbackText: "",
      fallbackNext: "",
      fallbackHref: "/home",
    };
  }
  const documents = data.documents[id] ?? [];
  const primary = primaryAction(data, id);
  const lines = SCHEMES.map((scheme) => {
    const result = assessEligibility({
      schemeId: scheme.id,
      profile,
      documents,
      connection: data.connection === "sourceUnavailable" ? "sourceUnavailable" : data.connection,
    });
    const unmet = result.unmet
      .slice(0, 2)
      .map((reason) => reasonText(lang, reason))
      .join("; ");
    return `${t(lang, `scheme.${scheme.id}.name`)}: ${t(lang, `status.${result.status}`)}${unmet ? `. ${unmet}` : ""}`;
  });
  const docs = documents
    .map((item) => `${t(lang, `doc.${item.kind}`)}: ${item.status}`)
    .join("; ");
  const apps = data.applications
    .filter((item) => item.personaId === id)
    .map((item) => `${t(lang, `scheme.${item.schemeId}.name`)}: ${t(lang, `app.${item.status}`)}`)
    .join("; ");
  const focus = t(lang, `card.${primary.action}.title`);
  const href = hrefFor(primary.action, primary.schemeId, primary.applicationId);
  const brief = [
    `Screen: ${page}`,
    `Study: ${t(lang, `level.${profile.studyLevel}`)}, ${profile.district}, ${profile.state}. Goal: ${profile.goal}.`,
    `Focus: ${t(lang, `scheme.${primary.schemeId}.name`)}. ${t(lang, `status.${primary.status}`)}. Step: ${focus}. Open: ${href}`,
    `Schemes: ${lines.join(" | ")}`,
    `Documents: ${docs || "none stored"}`,
    `Applications: ${apps || "none"}`,
    `Connection: ${data.connection}`,
  ].join("\n");
  return {
    brief,
    fallbackText: `${t(lang, `scheme.${primary.schemeId}.name`)}. ${t(lang, `status.${primary.status}`)}. ${focus}`,
    fallbackNext: t(lang, `card.${primary.action}.cta`),
    fallbackHref: href,
  };
}
