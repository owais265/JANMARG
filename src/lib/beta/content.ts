export const BETA_LINE =
  "JANMARG provides scholarship guidance and readiness support. It is not an official government portal and is not connected to live government scholarship, DigiLocker, identity, or payment systems. Final eligibility, verification, sanction, application status, and payment decisions remain with the relevant official authority.";

export const BOUNDARY =
  "JANMARG helps you prepare and understand your journey. Applications and official decisions happen on the relevant government portal.";

export const SENSITIVE_WARNING =
  "Do not enter Aadhaar, bank details, passwords, OTPs, or government portal credentials into JANMARG.";

export const CONSENT_TEXT =
  "I have read and agree to the Privacy Notice and understand JANMARG provides guidance, not official scholarship decisions.";

export const CONSENT_VERSION = "privacy-2026-09-30";

/** Flip these in source to pause the or the assistant. */
export const MAINTENANCE_MODE = false;
export const JAGO_ENABLED = true;

export const MOTA = "https://tribal.nic.in/scholarship.aspx";
export const NSP = "https://scholarships.gov.in/";

export type StageId =
  | "CLASS_9_10"
  | "CLASS_11_12"
  | "UNDERGRADUATE"
  | "POSTGRADUATE"
  | "RESEARCH"
  | "OVERSEAS_APPLICANT";

export type IncomeBand = "BELOW_1_LAKH" | "1_TO_2_5_LAKH" | "2_5_TO_5_LAKH" | "ABOVE_5_LAKH" | "PREFER_NOT_TO_SAY" | "";

export const STAGES: { id: StageId; label: string }[] = [
  { id: "CLASS_9_10", label: "Class 9–10" },
  { id: "CLASS_11_12", label: "Class 11–12" },
  { id: "UNDERGRADUATE", label: "Undergraduate" },
  { id: "POSTGRADUATE", label: "Postgraduate" },
  { id: "RESEARCH", label: "Research / Fellowship" },
  { id: "OVERSEAS_APPLICANT", label: "Planning overseas study" },
];

export const INCOME_BANDS: { id: IncomeBand; label: string }[] = [
  { id: "BELOW_1_LAKH", label: "Below ₹1 lakh" },
  { id: "1_TO_2_5_LAKH", label: "₹1 lakh to ₹2.5 lakh" },
  { id: "2_5_TO_5_LAKH", label: "₹2.5 lakh to ₹5 lakh" },
  { id: "ABOVE_5_LAKH", label: "Above ₹5 lakh" },
  { id: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

export const STATES = ["Jharkhand", "Odisha", "Chhattisgarh", "Madhya Pradesh", "Gujarat", "Rajasthan", "Maharashtra", "Andhra Pradesh", "Telangana", "Other"];

export type SchemeCode = "pre-matric" | "post-matric" | "top-class" | "nfst" | "nos";

export type Scheme = {
  code: SchemeCode;
  name: string;
  who: string;
  about: string;
  prepare: string[];
};

export const SCHEMES: Scheme[] = [
  {
    code: "pre-matric",
    name: "Pre-Matric Scholarship for ST Students",
    who: "Students still in Class 9 or Class 10 who want to understand this scheme before visiting the official portal.",
    about: "A school-stage scholarship described by the Ministry of Tribal Affairs for Scheduled Tribe students. JANMARG only helps you prepare. It does not decide who receives support.",
    prepare: ["Education stage and school context", "Category information the official portal asks for", "Income-related information the current guideline asks for", "How to reach the official application page"],
  },
  {
    code: "post-matric",
    name: "Post-Matric Scholarship for ST Students",
    who: "Students in Class 11 or above, including college, who want a preparation checklist.",
    about: "A post-school scholarship described by the Ministry of Tribal Affairs for Scheduled Tribe students in recognised courses. Confirm the current course list on the official page before you apply.",
    prepare: ["Course and institution type", "Enrollment or continuation details the portal asks for", "Category and income information required by the current guideline", "The official portal steps, completed there and not here"],
  },
  {
    code: "top-class",
    name: "Top Class Education Scheme for ST Students",
    who: "Students in higher education who want to check whether a notified-institute scheme is worth reading.",
    about: "A higher-education scheme described for Scheduled Tribe students at notified institutes. The institute list changes. JANMARG does not keep a live list and does not confirm a seat or an award.",
    prepare: ["Whether the institute is on the current notified list", "Course level", "The income information the current guideline asks for", "The official instruction page"],
  },
  {
    code: "nfst",
    name: "National Fellowship for ST Students",
    who: "Students planning MPhil, PhD, or similar research who want fellowship preparation notes.",
    about: "A research fellowship described for Scheduled Tribe students. Selection rules are published by the ministry. JANMARG does not accept fellowship forms.",
    prepare: ["Research stage", "Current published fellowship instructions", "Academic records the official process asks for", "Where the official fellowship page sends applicants"],
  },
  {
    code: "nos",
    name: "National Overseas Scholarship",
    who: "Students planning study outside India who want to understand the preparation path.",
    about: "An overseas scholarship described for Scheduled Tribe students. Rules, fields of study, and timelines are published officially and change. JANMARG does not file an overseas application.",
    prepare: ["Intended level of study", "The current official instruction set", "Documents the official process lists", "The official submission channel, used only on that site"],
  },
];

export const CHECKLIST = [
  { id: "category", label: "Category-related document", hint: "Check official requirements. Do not upload it here." },
  { id: "income", label: "Income-related document", hint: "Check the current scheme requirement. Do not type a certificate number." },
  { id: "education", label: "Education or enrollment proof", hint: "Check the current scheme requirement." },
  { id: "bank", label: "Bank or account information", hint: "Enter this only on the official portal if that portal asks for it." },
  { id: "academic", label: "Previous academic record", hint: "Check the official scheme list." },
  { id: "identity", label: "Identity document", hint: "Use it only where the official portal asks. Do not enter the number here." },
];

export type Chunk = { id: string; title: string; url: string; text: string; reviewed: string };

export const CHUNKS: Chunk[] = [
  {
    id: "mota-page",
    title: "Ministry of Tribal Affairs — Scholarship page",
    url: MOTA,
    reviewed: "2026-09-30",
    text: "The ministry publishes scholarship information, including Pre-Matric, Post-Matric, Top Class, National Fellowship, and National Overseas Scholarship, on its public scholarship page. Use that page for current rules.",
  },
  {
    id: "nsp-page",
    title: "National Scholarship Portal",
    url: NSP,
    reviewed: "2026-09-30",
    text: "Students complete many scholarship applications on the official portal, not inside a guidance app. If a scheme tells you to apply there, open that site yourself.",
  },
  {
    id: "prepare",
    title: "JANMARG preparation note",
    url: MOTA,
    reviewed: "2026-09-30",
    text: "A readiness checklist can remind you what to look up. It is not an application, not a verification, and not a payment status.",
  },
];

export const JAGO_FALLBACK =
  "Main is baat ko available official-source content se confirm nahi kar pa raha/rahi hoon. Kripya relevant official scholarship portal check karein.";
