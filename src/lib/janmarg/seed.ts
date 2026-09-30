import type {
  AppData,
  DocumentKind,
  DocumentRecord,
  Provenance,
  ProvenanceSource,
  SchemeId,
  StudentProfile,
  StudyLevel,
} from "./types.ts";

const AT = "2026-08-01T10:00:00+05:30";

function prov(source: ProvenanceSource): Provenance {
  return { source, at: AT };
}

function doc(input: {
  id: string;
  personaId: string;
  kind: DocumentKind;
  source: DocumentRecord["source"];
  origin: ProvenanceSource;
  status: DocumentRecord["status"];
  expiry: string | null;
  referenceMasked: string;
  reusableFor: SchemeId[];
  mapsTo: string[];
  extractedName: string | null;
  consent?: DocumentRecord["consent"];
}): DocumentRecord {
  return { consent: "granted", ...input };
}

function baseProfile(input: {
  id: string;
  legalName: string;
  nameSource: ProvenanceSource;
  birthYear: number;
  state: string;
  district: string;
  studyLevel: StudyLevel;
  studySource: ProvenanceSource;
  institutionId: string;
  institutionName: string;
  institutionSource: ProvenanceSource;
  courseName: string;
  familyIncomeInr: number;
  goal: StudentProfile["goal"];
  mobileMasked: string;
}): StudentProfile {
  return {
    id: input.id,
    legalName: input.legalName,
    nameProvenance: prov(input.nameSource),
    birthYear: input.birthYear,
    birthYearProvenance: prov("userEntered"),
    stStatus: "st",
    stProvenance: prov("digilockerMock"),
    state: input.state,
    district: input.district,
    placeProvenance: prov("userEntered"),
    studyLevel: input.studyLevel,
    studyProvenance: prov(input.studySource),
    institutionId: input.institutionId,
    institutionName: input.institutionName,
    institutionProvenance: prov(input.institutionSource),
    courseName: input.courseName,
    familyIncomeInr: input.familyIncomeInr,
    incomeProvenance: prov("digilockerMock"),
    otherCentralScholarship: false,
    goal: input.goal,
    mobileMasked: input.mobileMasked,
  };
}

const asha = baseProfile({
  id: "asha",
  legalName: "Asha Munda",
  nameSource: "userEntered",
  birthYear: 2009,
  state: "Chhattisgarh",
  district: "Jashpur",
  studyLevel: "class11",
  studySource: "institutionMock",
  institutionId: "ghss-jashpur",
  institutionName: "Government Higher Secondary School, Jashpur",
  institutionSource: "institutionMock",
  courseName: "Class 11, Science",
  familyIncomeInr: 148000,
  goal: "domestic",
  mobileMasked: "•••• 2194",
});

const birsa = baseProfile({
  id: "birsa",
  legalName: "Birsa Kachhap",
  nameSource: "academicRegistryMock",
  birthYear: 2004,
  state: "Jharkhand",
  district: "Khunti",
  studyLevel: "ug",
  studySource: "institutionMock",
  institutionId: "iit-delhi",
  institutionName: "Indian Institute of Technology Delhi",
  institutionSource: "institutionMock",
  courseName: "B.Tech, Electrical Engineering",
  familyIncomeInr: 420000,
  goal: "domestic",
  mobileMasked: "•••• 7731",
});

const meera = baseProfile({
  id: "meera",
  legalName: "Meera Oraon",
  nameSource: "userEntered",
  birthYear: 2001,
  state: "Odisha",
  district: "Mayurbhanj",
  studyLevel: "overseasMasters",
  studySource: "userEntered",
  institutionId: "not-enrolled",
  institutionName: "Not enrolled abroad yet",
  institutionSource: "userEntered",
  courseName: "Master's, intended abroad",
  familyIncomeInr: 310000,
  goal: "overseas",
  mobileMasked: "•••• 6408",
});

const dev = baseProfile({
  id: "dev",
  legalName: "Dev Pahadi",
  nameSource: "userEntered",
  birthYear: 2008,
  state: "Jharkhand",
  district: "West Singhbhum",
  studyLevel: "class12",
  studySource: "institutionMock",
  institutionId: "ghss-chaibasa",
  institutionName: "Government Higher Secondary School, Chaibasa",
  institutionSource: "institutionMock",
  courseName: "Class 12, Arts",
  familyIncomeInr: 190000,
  goal: "domestic",
  mobileMasked: "•••• 1186",
});

const nila = baseProfile({
  id: "nila",
  legalName: "Nila Gond",
  nameSource: "userEntered",
  birthYear: 2008,
  state: "Rajasthan",
  district: "Dungarpur",
  studyLevel: "class12",
  studySource: "institutionMock",
  institutionId: "ghss-dungarpur",
  institutionName: "Government Higher Secondary School, Dungarpur",
  institutionSource: "institutionMock",
  courseName: "Class 12, Science",
  familyIncomeInr: 160000,
  goal: "domestic",
  mobileMasked: "•••• 5520",
});

function schoolPack(
  personaId: string,
  name: string,
  incomeExpiry: string,
  incomeStatus: DocumentRecord["status"],
  markName: string,
  markStatus: DocumentRecord["status"],
): DocumentRecord[] {
  const reuse: SchemeId[] = ["preMatric", "postMatric"];
  return [
    doc({
      id: `${personaId}-caste`,
      personaId,
      kind: "casteCertificate",
      source: "digilockerMock",
      origin: "digilockerMock",
      status: "verified",
      expiry: null,
      referenceMasked: "ST-••••1842",
      reusableFor: [...reuse, "topClass", "nfst", "nos"],
      mapsTo: ["stStatus"],
      extractedName: name,
    }),
    doc({
      id: `${personaId}-income`,
      personaId,
      kind: "incomeCertificate",
      source: "digilockerMock",
      origin: "digilockerMock",
      status: incomeStatus,
      expiry: incomeExpiry,
      referenceMasked: "INC-••••3391",
      reusableFor: reuse,
      mapsTo: ["familyIncomeInr"],
      extractedName: null,
    }),
    doc({
      id: `${personaId}-mark`,
      personaId,
      kind: "marksheet",
      source: "academicRegistryMock",
      origin: "academicRegistryMock",
      status: markStatus,
      expiry: null,
      referenceMasked: "MK-••••9021",
      reusableFor: reuse,
      mapsTo: ["legalName", "studyLevel"],
      extractedName: markName,
    }),
    doc({
      id: `${personaId}-admit`,
      personaId,
      kind: "admissionProof",
      source: "userUpload",
      origin: "institutionMock",
      status: "verified",
      expiry: "2027-04-30",
      referenceMasked: "ADM-••••4410",
      reusableFor: ["postMatric"],
      mapsTo: ["institutionName", "courseName"],
      extractedName: name,
    }),
  ];
}

const birsaDocs: DocumentRecord[] = [
  doc({
    id: "birsa-caste",
    personaId: "birsa",
    kind: "casteCertificate",
    source: "digilockerMock",
    origin: "digilockerMock",
    status: "verified",
    expiry: null,
    referenceMasked: "ST-••••2208",
    reusableFor: ["postMatric", "topClass", "nfst", "nos"],
    mapsTo: ["stStatus"],
    extractedName: "Birsa Kachhap",
  }),
  doc({
    id: "birsa-income",
    personaId: "birsa",
    kind: "incomeCertificate",
    source: "digilockerMock",
    origin: "digilockerMock",
    status: "verified",
    expiry: "2027-01-31",
    referenceMasked: "INC-••••7740",
    reusableFor: ["postMatric", "topClass"],
    mapsTo: ["familyIncomeInr"],
    extractedName: null,
  }),
  doc({
    id: "birsa-mark",
    personaId: "birsa",
    kind: "marksheet",
    source: "academicRegistryMock",
    origin: "academicRegistryMock",
    status: "verified",
    expiry: null,
    referenceMasked: "MK-••••1553",
    reusableFor: ["topClass", "postMatric"],
    mapsTo: ["legalName"],
    extractedName: "Birsa Kachhap",
  }),
  doc({
    id: "birsa-admit",
    personaId: "birsa",
    kind: "admissionProof",
    source: "userUpload",
    origin: "institutionMock",
    status: "verified",
    expiry: "2027-06-30",
    referenceMasked: "ADM-••••8801",
    reusableFor: ["topClass"],
    mapsTo: ["courseName", "institutionName"],
    extractedName: "Birsa Kachhap",
  }),
  doc({
    id: "birsa-inst",
    personaId: "birsa",
    kind: "instituteCertificate",
    source: "userUpload",
    origin: "institutionMock",
    status: "verified",
    expiry: "2027-06-30",
    referenceMasked: "INS-••••0194",
    reusableFor: ["topClass"],
    mapsTo: ["institutionName"],
    extractedName: "Birsa Kachhap",
  }),
];

const meeraDocs: DocumentRecord[] = [
  doc({
    id: "meera-caste",
    personaId: "meera",
    kind: "casteCertificate",
    source: "digilockerMock",
    origin: "digilockerMock",
    status: "verified",
    expiry: null,
    referenceMasked: "ST-••••6612",
    reusableFor: ["nos", "postMatric"],
    mapsTo: ["stStatus"],
    extractedName: "Meera Oraon",
  }),
  doc({
    id: "meera-income",
    personaId: "meera",
    kind: "incomeCertificate",
    source: "digilockerMock",
    origin: "digilockerMock",
    status: "verified",
    expiry: "2027-02-28",
    referenceMasked: "INC-••••2744",
    reusableFor: ["nos"],
    mapsTo: ["familyIncomeInr"],
    extractedName: null,
  }),
  doc({
    id: "meera-mark",
    personaId: "meera",
    kind: "marksheet",
    source: "academicRegistryMock",
    origin: "academicRegistryMock",
    status: "verified",
    expiry: null,
    referenceMasked: "MK-••••3008",
    reusableFor: ["nos"],
    mapsTo: ["legalName"],
    extractedName: "Meera Oraon",
  }),
];

export function lockerCatalog(personaId: string): DocumentRecord[] {
  if (personaId !== "meera") return [];
  return [
    doc({
      id: "meera-passport",
      personaId: "meera",
      kind: "passport",
      source: "digilockerMock",
      origin: "digilockerMock",
      status: "verified",
      expiry: "2031-05-01",
      referenceMasked: "PP-••••4419",
      reusableFor: ["nos"],
      mapsTo: ["legalName"],
      extractedName: "Meera Oraon",
    }),
  ];
}

export const PERSONA_IDS = ["asha", "birsa", "meera", "dev", "nila"] as const;

export function createWorld(): AppData {
  return {
    lang: "en",
    langChosen: false,
    personaId: null,
    otpVerified: false,
    consentAccepted: false,
    role: "student",
    connection: "online",
    profiles: { asha, birsa, meera, dev, nila },
    documents: {
      asha: schoolPack("asha", "Asha Munda", "2025-11-30", "expired", "Asha Munda", "verified"),
      birsa: birsaDocs,
      meera: meeraDocs,
      dev: schoolPack("dev", "Dev Pahadi", "2027-03-31", "verified", "Dev Kumar Pahadi", "mismatch"),
      nila: schoolPack("nila", "Nila Gond", "2027-05-31", "verified", "Nila Gond", "verified"),
    },
    applications: [],
    events: [],
    notifications: [
      {
        id: "n-asha",
        personaId: "asha",
        tone: "high",
        titleKey: "note.asha.title",
        bodyKey: "note.asha.body",
        href: "/documents",
        read: false,
        at: "2026-09-28T09:00:00+05:30",
      },
      {
        id: "n-birsa",
        personaId: "birsa",
        tone: "normal",
        titleKey: "note.birsa.title",
        bodyKey: "note.birsa.body",
        href: "/schemes/top-class",
        read: false,
        at: "2026-09-27T11:00:00+05:30",
      },
      {
        id: "n-meera",
        personaId: "meera",
        tone: "high",
        titleKey: "note.meera.title",
        bodyKey: "note.meera.body",
        href: "/eligibility/nos",
        read: false,
        at: "2026-09-26T15:00:00+05:30",
      },
      {
        id: "n-dev",
        personaId: "dev",
        tone: "high",
        titleKey: "note.dev.title",
        bodyKey: "note.dev.body",
        href: "/verification",
        read: false,
        at: "2026-09-28T08:30:00+05:30",
      },
      {
        id: "n-nila",
        personaId: "nila",
        tone: "normal",
        titleKey: "note.nila.title",
        bodyKey: "note.nila.body",
        href: "/apply/post-matric",
        read: false,
        at: "2026-09-28T18:12:00+05:30",
      },
    ],
    mismatchCases: [],
    consents: PERSONA_IDS.map((personaId) => ({
      id: `consent-seed-${personaId}`,
      personaId,
      purposeKey: "consent.seed",
      granted: true,
      at: AT,
      version: "consent-demo-1" as const,
    })),
    audits: [
      {
        id: "audit-nila-draft",
        personaId: "nila",
        at: "2026-09-28T18:10:00+05:30",
        actionKey: "audit.draftSaved",
      },
    ],
    messages: [],
    drafts: [
      {
        id: "draft-nila",
        personaId: "nila",
        schemeId: "postMatric",
        step: 1,
        selectedDocIds: ["nila-caste", "nila-income", "nila-mark", "nila-admit"],
        instituteConfirmed: false,
        offlineSaved: true,
        updatedAt: "2026-09-28T18:10:00+05:30",
      },
    ],
    helpRequests: [],
  };
}
