import type { IncomeBand, StageId } from "./content";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../janmarg/remote.ts";

export type PortalStatus = "action" | "watching" | "clear" | "none";

export type LockerStudent = {
  id: string;
  legal_name: string;
  birth_year: number;
  st_status: string;
  state_name: string;
  district: string;
  study_level: string;
  institution_name: string;
  course_name: string;
  family_income_inr: number;
  goal: string;
  mobile_masked: string;
};

export type LockerDoc = {
  kind: string;
  status: string;
  reference: string;
  name_on_document: string | null;
};

export type PortalRow = {
  id: string;
  name: string;
  url: string;
  scheme: string;
  status: PortalStatus;
  detail: string;
};

export type LockerFile = {
  student: LockerStudent;
  documents: LockerDoc[];
  portals: PortalRow[];
  pulled_at: string;
};

/** Short practice-file brief for JAGO. No income, mobile, birth year, or reference numbers. */
export function practiceBrief(file: LockerFile | null): string {
  if (!file) return "";
  const student = file.student;
  const docs = file.documents
    .map((doc) => `${doc.kind} is ${doc.status}${doc.name_on_document ? `, name on paper ${doc.name_on_document}` : ""}`)
    .join(". ");
  const portals = file.portals
    .filter((row) => row.status !== "none")
    .map((row) => `${row.name} for ${row.scheme} is ${row.status}: ${row.detail}`)
    .join(" ");
  return `Practice file only, not a live government record. ${student.legal_name} studies ${student.course_name} at ${student.institution_name}, ${student.district}, ${student.state_name}. Documents: ${docs}. ${portals}`
    .replace(/\s+/g, " ")
    .slice(0, 1400);
}

const NSP = "https://scholarships.gov.in/";
const DBT = "https://dbttribal.gov.in/";
const SFMP = "https://scholarship.canarabank.bank.in/";
const NFST = "https://fellowship.tribal.gov.in/";
const NOS = "https://overseas.tribal.gov.in/";

function row(
  id: string,
  name: string,
  url: string,
  scheme: string,
  status: PortalStatus,
  detail: string,
): PortalRow {
  return { id, name, url, scheme, status, detail };
}

/** Same portal narrative the database function returns, used if the network call fails. */
export function portalsFor(studentId: string): PortalRow[] {
  if (studentId === "asha") {
    return [
      row("nsp", "National Scholarship Portal", NSP, "Post-Matric", "action", "Income certificate in the locker is expired. NSP will not move this file until a current certificate is issued."),
      row("dbt", "DBT Tribal", DBT, "Post-Matric", "watching", "State verification is waiting on the same income certificate."),
      row("sfmp", "Canara SFMP", SFMP, "Post-Matric", "watching", "No sanction has reached the payment portal."),
      row("nfst", "National Fellowship", NFST, "NFST", "none", "No fellowship file for this student."),
      row("nos", "National Overseas Scholarship", NOS, "NOS", "none", "No overseas file."),
    ];
  }
  if (studentId === "dev") {
    return [
      row("nsp", "National Scholarship Portal", NSP, "Post-Matric", "action", "Marksheet name is Deb Kumar Munda. The ST certificate says Dev Kumar Munda. NSP has held the file for this name mismatch."),
      row("dbt", "DBT Tribal", DBT, "Post-Matric", "action", "The same name mismatch is open with the state verifier."),
      row("sfmp", "Canara SFMP", SFMP, "Post-Matric", "watching", "Payment is not queued until the name is aligned."),
      row("nfst", "National Fellowship", NFST, "NFST", "none", "No fellowship file."),
      row("nos", "National Overseas Scholarship", NOS, "NOS", "none", "No overseas file."),
    ];
  }
  if (studentId === "birsa") {
    return [
      row("nsp", "National Scholarship Portal", NSP, "Top Class", "watching", "Documents match. NSP is waiting on institute verification for IIT Delhi."),
      row("dbt", "DBT Tribal", DBT, "Top Class", "clear", "No state deficiency on this file."),
      row("sfmp", "Canara SFMP", SFMP, "Top Class", "watching", "Sanction is not yet visible on Canara SFMP."),
      row("nfst", "National Fellowship", NFST, "NFST", "none", "Undergraduate file, not a fellowship."),
      row("nos", "National Overseas Scholarship", NOS, "NOS", "none", "No overseas file."),
    ];
  }
  if (studentId === "meera") {
    return [
      row("nos", "National Overseas Scholarship", NOS, "NOS", "action", "Overseas file is open. Passport and admission offer are not in the locker yet."),
      row("nsp", "National Scholarship Portal", NSP, "NOS", "none", "No domestic NSP application."),
      row("dbt", "DBT Tribal", DBT, "NOS", "none", "No state scholarship file."),
      row("sfmp", "Canara SFMP", SFMP, "NOS", "watching", "Canara SFMP has no payment row until NOS sanction."),
      row("nfst", "National Fellowship", NFST, "NFST", "none", "No fellowship file."),
    ];
  }
  return [
    row("nsp", "National Scholarship Portal", NSP, "Post-Matric", "watching", "Documents match. NSP verification is queued. Nothing is blocked."),
    row("dbt", "DBT Tribal", DBT, "Post-Matric", "clear", "State record matches the locker."),
    row("sfmp", "Canara SFMP", SFMP, "Post-Matric", "none", "No payment row yet."),
    row("nfst", "National Fellowship", NFST, "NFST", "none", "No fellowship file."),
    row("nos", "National Overseas Scholarship", NOS, "NOS", "none", "No overseas file."),
  ];
}

const LOCAL: LockerStudent[] = [
  {
    id: "asha",
    legal_name: "Asha Kerketta",
    birth_year: 2009,
    st_status: "st",
    state_name: "Chhattisgarh",
    district: "Jashpur",
    study_level: "class11",
    institution_name: "Government Higher Secondary School, Jashpur",
    course_name: "Class 11, Science",
    family_income_inr: 148000,
    goal: "domestic",
    mobile_masked: "•••• 2194",
  },
  {
    id: "birsa",
    legal_name: "Birsa Oraon",
    birth_year: 2004,
    st_status: "st",
    state_name: "Jharkhand",
    district: "Khunti",
    study_level: "ug",
    institution_name: "Indian Institute of Technology Delhi",
    course_name: "B.Tech, Electrical Engineering",
    family_income_inr: 420000,
    goal: "domestic",
    mobile_masked: "•••• 7731",
  },
  {
    id: "dev",
    legal_name: "Dev Kumar Munda",
    birth_year: 2008,
    st_status: "st",
    state_name: "Jharkhand",
    district: "West Singhbhum",
    study_level: "class12",
    institution_name: "Government Higher Secondary School, Chaibasa",
    course_name: "Class 12, Arts",
    family_income_inr: 190000,
    goal: "domestic",
    mobile_masked: "•••• 1186",
  },
  {
    id: "meera",
    legal_name: "Meera Hembram",
    birth_year: 2001,
    st_status: "st",
    state_name: "Odisha",
    district: "Mayurbhanj",
    study_level: "overseasMasters",
    institution_name: "Not enrolled abroad yet",
    course_name: "Master's, intended abroad",
    family_income_inr: 310000,
    goal: "overseas",
    mobile_masked: "•••• 6408",
  },
  {
    id: "nila",
    legal_name: "Nila Bai",
    birth_year: 2008,
    st_status: "st",
    state_name: "Rajasthan",
    district: "Dungarpur",
    study_level: "class12",
    institution_name: "Government Higher Secondary School, Dungarpur",
    course_name: "Class 12, Science",
    family_income_inr: 160000,
    goal: "domestic",
    mobile_masked: "•••• 5520",
  },
];

const DOCS: Record<string, LockerDoc[]> = {
  asha: [
    { kind: "admissionProof", status: "verified", reference: "ADM-••••4410", name_on_document: "Asha Kerketta" },
    { kind: "casteCertificate", status: "verified", reference: "ST-••••1842", name_on_document: "Asha Kerketta" },
    { kind: "incomeCertificate", status: "expired", reference: "INC-••••3391", name_on_document: null },
    { kind: "marksheet", status: "verified", reference: "MK-••••9021", name_on_document: "Asha Kerketta" },
  ],
  dev: [
    { kind: "admissionProof", status: "verified", reference: "ADM-••••4410", name_on_document: "Dev Kumar Munda" },
    { kind: "casteCertificate", status: "verified", reference: "ST-••••1842", name_on_document: "Dev Kumar Munda" },
    { kind: "incomeCertificate", status: "verified", reference: "INC-••••3391", name_on_document: null },
    { kind: "marksheet", status: "mismatch", reference: "MK-••••9021", name_on_document: "Deb Kumar Munda" },
  ],
};

export const STUDENT_IDS = LOCAL.map((student) => student.id);

export function randomStudentId(): string {
  const index = Math.floor(Math.random() * LOCAL.length);
  return LOCAL[index]?.id ?? "asha";
}

export function localLocker(studentId: string): LockerFile {
  const id = LOCAL.some((student) => student.id === studentId) ? studentId : randomStudentId();
  const student = LOCAL.find((item) => item.id === id) ?? LOCAL[0];
  return {
    student,
    documents: DOCS[student.id] ?? [
      { kind: "casteCertificate", status: "verified", reference: "ST-••••1842", name_on_document: student.legal_name },
      { kind: "incomeCertificate", status: "verified", reference: "INC-••••3391", name_on_document: null },
      { kind: "marksheet", status: "verified", reference: "MK-••••9021", name_on_document: student.legal_name },
    ],
    portals: portalsFor(student.id),
    pulled_at: new Date().toISOString(),
  };
}

function isFile(value: unknown): value is LockerFile {
  if (!value || typeof value !== "object") return false;
  const file = value as LockerFile;
  return Boolean(file.student?.legal_name && Array.isArray(file.portals) && Array.isArray(file.documents));
}

export async function fetchLocker(studentId = "random"): Promise<LockerFile> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/pull_student_file`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_student_id: studentId || "random" }),
    });
    if (!response.ok) return localLocker(studentId);
    const payload: unknown = await response.json();
    if (!isFile(payload)) return localLocker(studentId);
    return payload;
  } catch {
    return localLocker(studentId);
  }
}

export function stageFor(studyLevel: string): StageId {
  if (studyLevel === "class9" || studyLevel === "class10") return "CLASS_9_10";
  if (studyLevel === "class11" || studyLevel === "class12") return "CLASS_11_12";
  if (studyLevel === "pg") return "POSTGRADUATE";
  if (studyLevel === "research" || studyLevel === "phd") return "RESEARCH";
  if (studyLevel.startsWith("overseas")) return "OVERSEAS_APPLICANT";
  return "UNDERGRADUATE";
}

export function incomeFor(amount: number): IncomeBand {
  if (amount < 100000) return "BELOW_1_LAKH";
  if (amount <= 250000) return "1_TO_2_5_LAKH";
  if (amount <= 500000) return "2_5_TO_5_LAKH";
  return "ABOVE_5_LAKH";
}

export function docLabel(kind: string): string {
  if (kind === "casteCertificate") return "ST certificate";
  if (kind === "incomeCertificate") return "Income certificate";
  if (kind === "marksheet") return "Marksheet";
  if (kind === "admissionProof") return "Admission proof";
  if (kind === "instituteCertificate") return "Institute certificate";
  return kind;
}
