import type { SchemeId } from "./types.ts";

export type OfficialExtract = {
  scheme_id: SchemeId;
  source_url: string;
  source_title: string;
  quote: string;
};

/** Fallback if Supabase is down. Same sentences stored in public.official_extracts. */
export const OFFICIAL_EXTRACTS: OfficialExtract[] = [
  {
    scheme_id: "preMatric",
    source_url: "https://tribal.nic.in/scholarship.aspx",
    source_title: "Ministry of Tribal Affairs — scholarship page",
    quote:
      "Applicable to students who are studying in Classes IX – X. Parental income from all sources should not exceed Rs.2.50 lakhs per annum. Scholarships are paid @ Rs.225/- per month for Day Scholars and @ Rs.525/- per month for Hostellers, for a period of 10 months in a year.",
  },
  {
    scheme_id: "postMatric",
    source_url: "https://tribal.nic.in/scholarship.aspx",
    source_title: "Ministry of Tribal Affairs — scholarship page",
    quote:
      "Applicable to students who are pursuing any recognized course from a recognized institution for which qualification is Matriculation/Class X or above. Parental income from all sources should not exceed Rs.2.50 lakhs per annum. Compulsory fees are limited by the state. Maintenance varies from Rs.230 to Rs.1200 per month.",
  },
  {
    scheme_id: "topClass",
    source_url: "https://tribal.nic.in/scholarship.aspx",
    source_title: "Ministry of Tribal Affairs — scholarship page",
    quote:
      "The ministry page says 246 premier institutes, family income not above Rs.6.00 lakhs a year, and 1000 fresh students a year on class XII merit. NSP public list: student applications for this scheme open till 31-10-2026.",
  },
  {
    scheme_id: "nfst",
    source_url: "https://tribal.nic.in/scholarship.aspx",
    source_title: "Ministry of Tribal Affairs — scholarship page",
    quote:
      "The ministry page says 750 fresh students a year for M.Phil and Ph.D. It states Rs.25000 a month for M.Phil and Rs.28000 a month for Ph.D. The fellowship portal itself did not load.",
  },
  {
    scheme_id: "nos",
    source_url: "https://tribal.nic.in/scholarship.aspx",
    source_title: "Ministry of Tribal Affairs — scholarship page",
    quote:
      "The ministry page says 20 awards a year: 17 for ST students and 3 for PVTG students. Family income should not exceed Rs.6.00 lakhs a year. The overseas portal itself did not load.",
  },
];
