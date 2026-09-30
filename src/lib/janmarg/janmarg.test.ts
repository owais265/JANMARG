import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getStudentRecord, pollPortal, runVerificationLayer, verifyOtp } from "./adapters.ts";
import { healthOf, runGateway } from "./integrations.ts";
import { allCopyStrings, t } from "./copy.ts";
import { assessEligibility } from "./eligibility.ts";
import { KNOWLEDGE, answerQuestion } from "./knowledge.ts";
import { composeGrounded, isFileQuestion, respectsFile } from "./jago-ground.ts";
import { acceptModel, fallbackAnswer, parseModelAnswer, rankPassages } from "./jago-pipeline.ts";
import { allowFetch, classifyUrl, robotsDecision } from "./source-allowlist.ts";
import { demoEmbed, DEMO_DIM } from "./embed.ts";
import { classifyName } from "./names.ts";
import { containsStudentName, seedRollup } from "./officer.ts";
import { focusScheme, primaryAction } from "./plan.ts";
import { mockReceipt, reduceAlignName, reduceImportLocker, reducePoll, reduceRenewIncome, reduceSubmit, validateSubmission } from "./reduce.ts";
import { districtGaps, SEED_REGISTER, unreached } from "./coverage.ts";
import { stageMarks } from "./track.ts";
import { RULES, schemeFromSlug } from "./rules.ts";
import { createWorld } from "./seed.ts";
import { demoProfile } from "./repository.ts";

const BANNED = [/guaranteed scholarship/i, /you will receive funds/i, /\bapproved\b/i];

function world() {
  return createWorld();
}

function assessPersona(id: string, scheme = focusScheme(world().profiles[id])) {
  const data = world();
  return assessEligibility({
    schemeId: scheme,
    profile: data.profiles[id],
    documents: data.documents[id],
    connection: "online",
  });
}

describe("coverage gaps", () => {
  it("lists enrolled students with no scholarship file and no personal name", () => {
    const gaps = unreached(SEED_REGISTER);
    assert.equal(gaps.length, 6);
    assert.equal(gaps.find((row) => row.token === "UDISE-DEMO-102")?.reason, "no_apaar");
    assert.equal(gaps.find((row) => row.token === "UDISE-DEMO-103")?.reason, "no_otr");
    assert.equal(gaps.find((row) => row.token === "UDISE-DEMO-101")?.reason, "no_scholarship");
    assert.equal(gaps.some((row) => row.token === "UDISE-DEMO-104"), false);
    const jashpur = districtGaps(SEED_REGISTER).find((row) => row.district === "Jashpur");
    assert.equal(jashpur?.gap, 2);
    assert.equal(containsStudentName(gaps), false);
  });
});

describe("file stages", () => {
  it("stops before sanction and never marks money as sent on its own", () => {
    assert.equal(stageMarks("submitted").submission, "now");
    assert.equal(stageMarks("submitted").disbursement, "later");
    assert.equal(stageMarks("ministryReview").verification, "now");
    assert.equal(stageMarks("ministryReview").sanction, "later");
    assert.equal(stageMarks("disbursed").disbursement, "done");
    assert.equal(stageMarks("returned").verification, "stopped");
  });
});
describe("rules", () => {
  it("has a version for every scheme and never says the student is approved", () => {
    for (const rule of Object.values(RULES)) {
      assert.ok(rule.version.startsWith("DEMO-"));
    }
    const blob = JSON.stringify(RULES) + allCopyStrings().join("\n") + JSON.stringify(KNOWLEDGE);
    for (const pattern of BANNED) assert.equal(pattern.test(blob), false, pattern.source);
    assert.equal(
      t("en", "jago.fallback"),
      "I could not verify this from the current official sources. Please raise a help request.",
    );
  });
});

describe("JAGO pipeline", () => {
  it("keeps a model sentence only when it stays with the file", () => {
    const parsed = parseModelAnswer("The income certificate is out of date.\nNEXT: Replace it.");
    assert.equal(parsed?.text, "The income certificate is out of date.");
    assert.equal(parsed?.next, "Replace it.");
    assert.equal(parseModelAnswer("You are approved."), null);
    assert.equal(acceptModel("why is my file stuck", "The weather is fine.", "income certificate is out of date"), false);
    const ranked = rankPassages("income ceiling post matric", "en", KNOWLEDGE);
    assert.ok((ranked[0]?.score ?? 0) >= 0.28);
    const grounded = fallbackAnswer("why is my file stuck", "The income certificate is out of date.", ranked);
    assert.match(grounded ?? "", /income certificate/);
  });
});

describe("JAGO grounding", () => {
  it("answers a blocker from the file before a rule sentence", () => {
    assert.equal(isFileQuestion("Why is my file blocked?"), true);
    const text = composeGrounded("Why is my file blocked?", "Post-Matric. Needs evidence. Renew the income certificate.", "An expired certificate is missing evidence.");
    assert.ok(text?.startsWith("Post-Matric"));
    assert.ok(text?.includes("expired certificate"));
    assert.equal(respectsFile("The weather is fine.", "Post-Matric needs evidence"), false);
  });
});

describe("official source allowlist", () => {
  it("accepts an official https page and rejects everything else", () => {
    assert.equal(classifyUrl("https://tribal.nic.in/ScholarshiP.aspx"), "allowed");
    assert.equal(classifyUrl("https://example.com/scheme"), "off_allowlist");
    assert.equal(classifyUrl("https://scholarships.gov.in/login"), "blocked_path");
    assert.equal(classifyUrl("http://tribal.nic.in/ScholarshiP.aspx"), "not_https");
  });

  it("obeys robots.txt and the per-domain rate limit", () => {
    const robots = "User-agent: *\nDisallow: /private\nCrawl-delay: 2\n\nUser-agent: JANMARG-SIH-Research-Bot\nDisallow:\n";
    assert.equal(robotsDecision(robots, "/guidelines").allowed, true);
    assert.equal(robotsDecision("User-agent: *\nDisallow: /secret\n", "/secret/file").allowed, false);
    const stamps: number[] = [];
    for (let i = 0; i < 10; i += 1) assert.equal(allowFetch(stamps, 1_000 + i), true);
    assert.equal(allowFetch(stamps, 1_020), false);
  });
});

describe("demo retrieval", () => {
  it("keeps a stable 64-number stand-in until an embedding model exists", () => {
    const left = demoEmbed("income certificate expired");
    const again = demoEmbed("income certificate expired");
    assert.equal(left.length, DEMO_DIM);
    assert.deepEqual(left, again);
    const norm = Math.sqrt(left.reduce((sum, value) => sum + value * value, 0));
    assert.ok(Math.abs(norm - 1) < 0.02);
  });
});

describe("personas", () => {
  it("explains Asha’s expired income certificate", () => {
    const result = assessPersona("asha");
    assert.equal(result.status, "needsEvidence");
    assert.equal(result.policyVersion, "DEMO-PMS-2026.1");
    assert.ok(result.unmet.some((item) => item.code === "reason.doc.expired"));
    assert.equal(result.nextActions[0], "renewIncome");
    assert.equal(assessPersona("asha", "preMatric").status, "notMatched");
  });

  it("lets Asha become likely eligible after renewal", () => {
    const renewed = reduceRenewIncome(world(), "asha", "2026-09-29T12:00:00+05:30");
    const result = assessEligibility({
      schemeId: "postMatric",
      profile: renewed.profiles.asha,
      documents: renewed.documents.asha,
      connection: "online",
    });
    assert.equal(result.status, "likelyEligible");
    assert.equal(result.nextActions.includes("openWizard"), true);
  });

  it("matches Birsa to Top Class and not to Post-Matric income", () => {
    assert.equal(focusScheme(world().profiles.birsa), "topClass");
    assert.equal(assessPersona("birsa").status, "likelyEligible");
    assert.equal(assessPersona("birsa", "postMatric").status, "notMatched");
    assert.equal(primaryAction(world(), "birsa").action, "openWizard");
    const busy = world();
    busy.applications.push({
      id: "app-other",
      personaId: "birsa",
      schemeId: "postMatric",
      status: "submitted",
      receiptId: null,
      createdAt: "2026-09-29T00:00:00.000Z",
      updatedAt: "2026-09-29T00:00:00.000Z",
      owner: "student",
      delayChecks: 0,
      returnReasonKey: null,
    });
    const blocked = validateSubmission({
      data: busy,
      personaId: "birsa",
      schemeId: "topClass",
      selectedDocIds: [],
      instituteConfirmed: true,
    });
    assert.equal(blocked.ok, false);
    if (!blocked.ok) assert.equal(blocked.code, "exclusive");
  });

  it("keeps Meera on a readiness checklist without an award", () => {
    const result = assessPersona("meera");
    assert.equal(result.status, "needsEvidence");
    assert.ok(result.missingDocuments.includes("overseasOffer"));
    assert.ok(result.missingDocuments.includes("passport"));
    assert.equal(result.nextActions.includes("openWizard"), false);
    assert.equal(result.nextActions.includes("addOffer"), true);
    assert.equal(result.nextActions.includes("addPassport"), true);
    const imported = reduceImportLocker(world(), "meera", true, "2026-09-29T12:00:00+05:30");
    assert.equal(imported.outcome, "success");
    const after = assessEligibility({
      schemeId: "nos",
      profile: imported.data.profiles.meera,
      documents: imported.data.documents.meera,
      connection: "online",
    });
    assert.equal(after.status, "needsEvidence");
    assert.equal(after.missingDocuments.includes("overseasOffer"), true);
    assert.equal(after.missingDocuments.includes("passport"), false);
  });

  it("guides Dev’s name mismatch and clears it only when he confirms", () => {
    const result = assessPersona("dev");
    assert.equal(result.status, "needsEvidence");
    assert.ok(result.unmet.some((item) => item.code === "reason.doc.mismatch"));
    assert.equal(primaryAction(world(), "dev").action, "fixName");
    const fixed = reduceAlignName(world(), "dev", "2026-09-29T12:00:00+05:30");
    const after = assessEligibility({
      schemeId: "postMatric",
      profile: fixed.profiles.dev,
      documents: fixed.documents.dev,
      connection: "online",
    });
    assert.equal(fixed.profiles.dev.legalName, "Dev Kumar Pahadi");
    assert.equal(after.status, "likelyEligible");
  });

  it("resumes Nila’s offline draft", () => {
    const data = world();
    const draft = data.drafts.find((item) => item.personaId === "nila");
    assert.ok(draft);
    assert.equal(draft?.step, 1);
    assert.equal(draft?.offlineSaved, true);
    assert.equal(primaryAction(data, "nila").action, "resumeDraft");
    assert.equal(assessPersona("nila").status, "likelyEligible");
  });

  it("refuses a result when the source is down", () => {
    const data = world();
    const result = assessEligibility({
      schemeId: "postMatric",
      profile: data.profiles.asha,
      documents: data.documents.asha,
      connection: "sourceUnavailable",
    });
    assert.equal(result.status, "unavailable");
    assert.equal(result.nextActions[0], "retry");
  });
});

describe("names", () => {
  it("auto-cleans punctuation but not a real spelling change", () => {
    assert.equal(classifyName("Dev K. Munda", "Dev K Munda"), "auto");
    assert.equal(classifyName("Dev Kumar Munda", "Deb Kumar Munda"), "manual");
    assert.equal(classifyName("Nila Bai", "Nila Bai"), "match");
  });
});

describe("adapters", () => {
  it("rejects a bad OTP and reserves production mode", () => {
    assert.equal(verifyOtp("000000").outcome, "invalidOtp");
    assert.equal(verifyOtp("482913").outcome, "success");
    assert.equal(verifyOtp("482913", "productionAdapterReserved").outcome, "reserved");
  });

  it("returns a registry mismatch and a delayed portal", () => {
    const data = world();
    const mark = data.documents.dev.find((item) => item.kind === "marksheet");
    const record = getStudentRecord(data.profiles.dev, mark, "online");
    assert.equal(record.outcome, "mismatch");
    assert.equal(pollPortal(0, "online").outcome, "delayed");
    assert.equal(pollPortal(1, "online").outcome, "success");
    assert.equal(pollPortal(1, "offline").outcome, "sourceUnavailable");
    const dev = runVerificationLayer(data.profiles.dev, data.documents.dev, "online");
    assert.equal(dev.find((item) => item.id === "identity")?.route, "manualReview");
    assert.equal(dev.find((item) => item.id === "income")?.route, "reuse");
    const asha = runVerificationLayer(data.profiles.asha, data.documents.asha, "online");
    assert.equal(asha.find((item) => item.id === "income")?.route, "studentAction");
    assert.equal(asha.find((item) => item.id === "institutionSchool")?.outcome, "matched");
  });
});

describe("submit", () => {
  it("blocks Asha and Dev, then accepts Birsa and advances on the second check", () => {
    const base = world();
    assert.equal(
      validateSubmission({
        data: base,
        personaId: "asha",
        schemeId: "postMatric",
        selectedDocIds: ["asha-caste", "asha-income", "asha-mark", "asha-admit"],
        instituteConfirmed: true,
      }).ok,
      false,
    );
    assert.equal(
      validateSubmission({
        data: base,
        personaId: "dev",
        schemeId: "postMatric",
        selectedDocIds: ["dev-caste", "dev-income", "dev-mark", "dev-admit"],
        instituteConfirmed: true,
      }).ok,
      true,
    );
    const reviewed = reduceSubmit(base, {
      personaId: "dev",
      schemeId: "postMatric",
      selectedDocIds: ["dev-caste", "dev-income", "dev-mark", "dev-admit"],
      instituteConfirmed: true,
      at: "2026-09-29T12:00:00+05:30",
    });
    assert.equal(reviewed.outcome, "success");
    if (reviewed.outcome === "success") {
      assert.equal(reviewed.review, true);
      assert.equal(
        reviewed.data.mismatchCases.some((item) => item.personaId === "dev" && item.status === "inReview"),
        true,
      );
    }
    const offline = { ...base, connection: "offline" as const };
    const blocked = reduceSubmit(offline, {
      personaId: "birsa",
      schemeId: "topClass",
      selectedDocIds: ["birsa-caste", "birsa-income", "birsa-mark", "birsa-admit", "birsa-inst"],
      instituteConfirmed: true,
      at: "2026-09-29T12:00:00+05:30",
    });
    assert.equal(blocked.outcome, "offline");
    const sent = reduceSubmit(base, {
      personaId: "birsa",
      schemeId: "topClass",
      selectedDocIds: ["birsa-caste", "birsa-income", "birsa-mark", "birsa-admit", "birsa-inst"],
      instituteConfirmed: true,
      at: "2026-09-29T12:00:00+05:30",
    });
    assert.equal(sent.outcome, "success");
    if (sent.outcome !== "success") return;
    assert.match(sent.application.receiptId ?? "", /^JM-TC-2026-/);
    assert.equal(mockReceipt("topClass", 1), "JM-TC-2026-10001");
    const first = reducePoll(sent.data, sent.application.id, "2026-09-29T12:05:00+05:30");
    assert.equal(first.outcome, "delayed");
    const second = reducePoll(first.data, sent.application.id, "2026-09-29T12:10:00+05:30");
    assert.equal(second.outcome, "advanced");
    const app = second.data.applications.find((item) => item.id === sent.application.id);
    assert.equal(app?.status, "instituteVerification");
    assert.equal(app?.owner, "institute");
    const third = reducePoll(second.data, sent.application.id, "2026-09-29T12:15:00+05:30");
    const fourth = reducePoll(third.data, sent.application.id, "2026-09-29T12:20:00+05:30");
    const fifth = reducePoll(fourth.data, sent.application.id, "2026-09-29T12:25:00+05:30");
    const held = fifth.data.applications.find((item) => item.id === sent.application.id);
    assert.equal(held?.status, "ministryReview");
    assert.notEqual(held?.status, "disbursed");
  });

  it("does not submit NOS or Pre-Matric as an award", () => {
    const data = world();
    assert.equal(
      reduceSubmit(data, {
        personaId: "meera",
        schemeId: "nos",
        selectedDocIds: [],
        instituteConfirmed: true,
        at: "2026-09-29T12:00:00+05:30",
      }).outcome,
      "readinessOnly",
    );
    assert.equal(schemeFromSlug("pre-matric"), "preMatric");
  });
});

describe("jago", () => {
  it("cites an extract or refuses", () => {
    const income = answerQuestion("What is the income limit for post-matric?", "en");
    assert.equal(income.confident, true);
    assert.match(income.text ?? "", /2\.5 lakh/);
    assert.equal(income.citations[0]?.id, "pms-income");
    const money = answerQuestion("Will I get the scholarship money?", "en");
    assert.equal(money.confident, true);
    assert.match(money.text ?? "", /not a payment/i);
    const hindi = answerQuestion("पोस्ट-मैट्रिक की आय सीमा क्या है?", "hi");
    assert.equal(hindi.confident, true);
    const unknown = answerQuestion("quantum plasma welding", "en");
    assert.equal(unknown.confident, false);
    assert.equal(unknown.text, null);
  });
});

describe("gateway", () => {
  it("asks for consent, retries a dead source, and sends a mismatch to review", () => {
    const data = world();
    const base = {
      profile: data.profiles.asha,
      documents: data.documents.asha,
      applications: data.applications,
      at: "2026-09-29T12:00:00+05:30",
    };
    const closed = runGateway({ ...base, consent: false, connection: "online" });
    assert.equal(closed.every((call) => call.error === "consentDenied"), true);
    const down = runGateway({ ...base, consent: true, connection: "sourceUnavailable" });
    assert.equal(down[0]?.attempts, 2);
    assert.equal(down[0]?.ok, false);
    const dev = runGateway({
      profile: data.profiles.dev,
      documents: data.documents.dev,
      applications: [],
      consent: true,
      connection: "online",
      at: base.at,
    });
    const nsp = dev.find((call) => call.connector === "nsp");
    assert.equal(nsp?.payload?.status, "RETURNED_FOR_REVIEW");
    assert.equal(nsp?.payload?.review, true);
    assert.equal(healthOf(nsp!), "mismatch");
    assert.equal(dev.find((call) => call.connector === "dbt")?.payload?.status, "NOT_INITIATED");
    const official = runGateway({ ...base, consent: true, connection: "online", implementation: "official" });
    assert.equal(official[0]?.mode, "official");
    assert.equal(official[0]?.error, "notConfigured");
    assert.equal(official[0]?.attempts, 1);
  });
});

describe("personas", () => {
  it("keeps the five demo files", () => {
    assert.equal(demoProfile("asha")?.legalName, "Asha Munda");
    assert.equal(demoProfile("birsa")?.legalName, "Birsa Kachhap");
    assert.equal(demoProfile("meera")?.legalName, "Meera Oraon");
    assert.equal(demoProfile("dev")?.legalName, "Dev Pahadi");
    assert.equal(demoProfile("nila")?.legalName, "Nila Gond");
  });
});

describe("privacy", () => {
  it("keeps officer rollups free of names and avoids raw identifiers", () => {
    const data = world();
    const rollup = seedRollup(data);
    assert.equal(containsStudentName(rollup), false);
    assert.equal(rollup.expired >= 1, true);
    assert.equal(rollup.mismatches >= 1, true);
    assert.equal(rollup.drafts, 1);
    const blob = JSON.stringify(data);
    assert.equal(/\b\d{12}\b/.test(blob), false);
    assert.equal(/aadhaar|accountNumber|ifsc/i.test(blob), false);
    for (const list of Object.values(data.documents)) {
      for (const item of list) assert.match(item.referenceMasked, /•/);
    }
  });
});
