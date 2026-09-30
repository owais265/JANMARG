export type AppLang = "en" | "hi" | "hinglish" | "bn" | "or" | "te" | "ta" | "mr" | "gu" | "as" | "kn" | "sat";
export type DemoLang = AppLang;
export type DemoRole = "student" | "guardian" | "officer";
export type Scenario =
  | "happy_path"
  | "name_mismatch"
  | "missing_income_doc"
  | "payment_pending"
  | "source_unavailable";

export const ADAPTER_LABEL = "Not a live ministry connection. Confirm the final status on the official portal.";
export const DATA_LABEL = "Sample records only. No Aadhaar, bank number, or beneficiary file is stored.";
export const TRUST_LINE =
  "JANMARG suggests, explains, tracks, and routes. Official authorities remain responsible for verification, eligibility decisions, sanction, and payment.";
export const DISCLAIMER =
  "JANMARG does not replace official scholarship portals. It does not verify Aadhaar and it does not send payments.";
export const JAGO_FALLBACK =
  "Main is sawaal ko available official notes se confirm nahi kar pa raha/rahi hoon. Official portal check karein ya manual review maangein.";

export const APP_REF = "JM-POST-2026-ASH-001";

export type SchemeCode = "pre-matric" | "post-matric" | "top-class" | "nfst" | "nos";

export type Pack = { en: string; hi?: string; hinglish?: string } & Partial<Record<AppLang, string>>;

export function tx(lang: AppLang, pack: Pack): string {
  return pack[lang] ?? pack.hinglish ?? pack.hi ?? pack.en;
}

export const SCHEMES: {
  code: SchemeCode;
  full: boolean;
  url: string;
  name: Pack;
  purpose: Pack;
}[] = [
  {
    code: "pre-matric",
    full: true,
    url: "https://tribal.nic.in/scholarship.aspx",
    name: { en: "Pre-Matric Scholarship", hi: "प्री-मैट्रिक छात्रवृत्ति", hinglish: "Pre-Matric Scholarship" },
    purpose: {
      en: "Support for ST students in Classes IX and X.",
      hi: "कक्षा 9 और 10 के एसटी विद्यार्थियों के लिए सहायता।",
      hinglish: "Class IX–X ke ST students ke liye support.",
    },
  },
  {
    code: "post-matric",
    full: true,
    url: "https://tribal.nic.in/scholarship.aspx",
    name: { en: "Post-Matric Scholarship", hi: "पोस्ट-मैट्रिक छात्रवृत्ति", hinglish: "Post-Matric Scholarship" },
    purpose: {
      en: "Support after Class X, in a recognised course.",
      hi: "कक्षा 10 के बाद मान्यता प्राप्त कोर्स के लिए सहायता।",
      hinglish: "Class X ke baad recognised course ke liye support.",
    },
  },
  {
    code: "top-class",
    full: true,
    url: "https://scholarships.gov.in",
    name: { en: "Top Class Education Scheme", hi: "टॉप क्लास शिक्षा योजना", hinglish: "Top Class Education Scheme" },
    purpose: {
      en: "Support in notified institutes. Confirm the current institute list.",
      hi: "अधिसूचित संस्थानों में सहायता। वर्तमान सूची जाँचें।",
      hinglish: "Notified institutes ke liye. Current list confirm karein.",
    },
  },
  {
    code: "nfst",
    full: false,
    url: "https://fellowship.tribal.gov.in/",
    name: { en: "National Fellowship for ST Students", hi: "राष्ट्रीय फेलोशिप", hinglish: "National Fellowship (NFST)" },
    purpose: {
      en: "Fellowship information for research study. Full journey is future scope.",
      hi: "शोध अध्ययन की जानकारी। पूरा आवेदन भविष्य का दायरा है।",
      hinglish: "Research study ki jaankari. Poora apply flow future scope hai.",
    },
  },
  {
    code: "nos",
    full: false,
    url: "https://overseas.tribal.gov.in/",
    name: { en: "National Overseas Scholarship", hi: "राष्ट्रीय विदेशी छात्रवृत्ति", hinglish: "National Overseas Scholarship" },
    purpose: {
      en: "Limited awards for study abroad. Information view only.",
      hi: "विदेश अध्ययन के लिए सीमित पुरस्कार। केवल जानकारी।",
      hinglish: "Study abroad ke limited awards. Sirf information view.",
    },
  },
];

export type DocId = "st" | "income" | "bonafide" | "bank" | "marksheet" | "identity";

export type DocCard = {
  id: DocId;
  name: Pack;
  issued: string;
  expiry: string | null;
  source: Pack;
  state: "available" | "attention" | "expiring" | "missing" | "shared";
  holder: string;
};

const DOCS: DocCard[] = [
  {
    id: "st",
    name: { en: "ST Certificate", hi: "एसटी प्रमाण पत्र", hinglish: "ST Certificate" },
    issued: "2024-06-12",
    expiry: null,
    source: { en: "DigiLocker import", hi: "डिजीलॉकर आयात", hinglish: "DigiLocker import" },
    state: "available",
    holder: "Asha Munda",
  },
  {
    id: "income",
    name: { en: "Income Certificate", hi: "आय प्रमाण पत्र", hinglish: "Income Certificate" },
    issued: "2025-11-02",
    expiry: "2026-11-02",
    source: { en: "DigiLocker import", hi: "डिजीलॉकर आयात", hinglish: "DigiLocker import" },
    state: "attention",
    holder: "Asha Kumari Munda",
  },
  {
    id: "bonafide",
    name: { en: "College Bonafide", hi: "कॉलेज बोनाफाइड", hinglish: "College Bonafide" },
    issued: "2026-07-18",
    expiry: "2027-05-31",
    source: { en: "Uploaded by student", hi: "विद्यार्थी द्वारा अपलोड", hinglish: "Student ne upload kiya" },
    state: "available",
    holder: "Asha Munda",
  },
  {
    id: "bank",
    name: { en: "Bank passbook (masked)", hi: "बैंक पासबुक (छिपा हुआ)", hinglish: "Bank passbook (masked)" },
    issued: "2023-01-09",
    expiry: null,
    source: { en: "Entered on this file", hi: "इस फ़ाइल पर दर्ज", hinglish: "Entered on this file" },
    state: "available",
    holder: "Asha Munda",
  },
  {
    id: "marksheet",
    name: { en: "Previous marksheet", hi: "पिछली मार्कशीट", hinglish: "Previous marksheet" },
    issued: "2026-05-20",
    expiry: null,
    source: { en: "Uploaded by student", hi: "विद्यार्थी द्वारा अपलोड", hinglish: "Student ne upload kiya" },
    state: "available",
    holder: "Asha Munda",
  },
  {
    id: "identity",
    name: { en: "Identity record (masked)", hi: "पहचान रिकॉर्ड (छिपा हुआ)", hinglish: "Identity record (masked)" },
    issued: "2018-03-01",
    expiry: null,
    source: { en: "Entered on this file", hi: "इस फ़ाइल पर दर्ज", hinglish: "Entered on this file" },
    state: "available",
    holder: "Asha Munda",
  },
];

export type ChatTurn = {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations: { title: string; url: string; excerpt: string }[];
  fileBased: boolean;
  actions: { label: string; to: string }[];
};

export type ShowcaseData = {
  role: DemoRole | null;
  lang: DemoLang;
  onboarded: boolean;
  scenario: Scenario;
  reviewSubmitted: boolean;
  clarification: string;
  consentImport: boolean;
  imported: boolean;
  shares: Partial<Record<DocId, boolean>>;
  readNotes: string[];
  chat: ChatTurn[];
  officerNote: string;
  draft: string;
  futureAsk: string;
};

export const emptyShowcase = (): ShowcaseData => ({
  role: null,
  lang: "hinglish",
  onboarded: false,
  scenario: "name_mismatch",
  reviewSubmitted: false,
  clarification: "My income certificate includes my middle name ‘Kumari’. My preferred profile name is Asha Munda.",
  consentImport: false,
  imported: true,
  shares: { st: true, bonafide: true, income: true },
  readNotes: [],
  chat: [],
  officerNote: "",
  draft: "",
  futureAsk: "",
});

export function documentsFor(data: ShowcaseData): DocCard[] {
  return DOCS.map((doc) => {
    if (doc.id !== "income") {
      return data.shares[doc.id] ? { ...doc, state: "shared" } : doc;
    }
    if (data.scenario === "missing_income_doc" && !data.imported) {
      return { ...doc, state: "missing", holder: "—" };
    }
    if (data.scenario === "happy_path" || data.scenario === "payment_pending") {
      return { ...doc, holder: "Asha Munda", state: data.shares.income ? "shared" : "available" };
    }
    if (data.reviewSubmitted) return { ...doc, state: "shared" };
    return { ...doc, state: "attention" };
  });
}

export type TimelineEvent = {
  id: string;
  at: string;
  title: Pack;
  detail: Pack;
  meaning: Pack;
  next: Pack;
  synthetic: boolean;
  current?: boolean;
};

export function timeline(data: ShowcaseData): TimelineEvent[] {
  const base: TimelineEvent[] = [
    {
      id: "created",
      at: "2026-08-02",
      title: { en: "Profile ready", hi: "प्रोफ़ाइल तैयार", hinglish: "Profile ready" },
      detail: { en: "Application created.", hi: "आवेदन बना।", hinglish: "Application create ho gaya." },
      meaning: { en: "Your file has a reference ID.", hi: "आपकी फ़ाइल को एक आईडी मिली।", hinglish: "File ko reference ID mil gayi." },
      next: { en: "Keep documents in the passport.", hi: "दस्तावेज़ पासपोर्ट में रखें।", hinglish: "Documents passport mein rakho." },
      synthetic: true,
    },
    {
      id: "docs",
      at: "2026-08-05",
      title: { en: "Documents added", hi: "दस्तावेज़ जोड़े गए", hinglish: "Documents add ho gaye" },
      detail: { en: "Shared through Document Passport.", hi: "डॉक्यूमेंट पासपोर्ट से साझा।", hinglish: "Document Passport se share hue." },
      meaning: { en: "Reuse stays on this application.", hi: "पुनः उपयोग इसी आवेदन तक है।", hinglish: "Reuse isi application tak hai." },
      next: { en: "You can revoke a share.", hi: "आप साझा करना रोक सकते हैं।", hinglish: "Share revoke kar sakte ho." },
      synthetic: true,
    },
    {
      id: "submitted",
      at: "2026-08-08",
      title: { en: "Application submitted", hi: "आवेदन जमा", hinglish: "Application submit ho gaya" },
      detail: { en: "Post-Matric file submitted.", hi: "पोस्ट-मैट्रिक फ़ाइल जमा।", hinglish: "Post-Matric file submit ho gayi." },
      meaning: { en: "This is not a government receipt.", hi: "यह सरकारी रसीद नहीं है।", hinglish: "Yeh government receipt nahi hai." },
      next: { en: "Watch the next verification step.", hi: "अगला जाँच चरण देखें।", hinglish: "Agla verification step dekho." },
      synthetic: true,
    },
  ];
  if (data.scenario === "source_unavailable") {
    return [
      ...base,
      {
        id: "down",
        at: "2026-08-09",
        current: true,
        title: { en: "Status source unavailable", hi: "स्थिति स्रोत उपलब्ध नहीं", hinglish: "Status source unavailable" },
        detail: { en: "We could not fetch the latest status.", hi: "नवीनतम स्थिति नहीं मिली।", hinglish: "Latest status nahi mila." },
        meaning: { en: "Saved information is still on this screen.", hi: "सहेजी जानकारी इसी स्क्रीन पर है।", hinglish: "Saved info abhi bhi yahin hai." },
        next: { en: "Try again, or request manual review.", hi: "फिर कोशिश करें या समीक्षा माँगें।", hinglish: "Try again, ya manual review maango." },
        synthetic: true,
      },
    ];
  }
  if (data.scenario === "missing_income_doc") {
    return [
      ...base,
      {
        id: "missing",
        at: "2026-08-09",
        current: true,
        title: { en: "Income document missing", hi: "आय प्रमाण नहीं मिला", hinglish: "Income document missing" },
        detail: { en: "Document Passport has no income certificate.", hi: "पासपोर्ट में आय प्रमाण नहीं है।", hinglish: "Passport mein income certificate nahi hai." },
        meaning: { en: "This is missing information, not a rejection.", hi: "यह कमी है, अस्वीकृति नहीं।", hinglish: "Yeh kami hai, rejection nahi." },
        next: { en: "Import or add the income certificate.", hi: "आय प्रमाण जोड़ें।", hinglish: "Income certificate import ya add karo." },
        synthetic: true,
      },
    ];
  }
  if (data.scenario === "happy_path" || data.scenario === "payment_pending") {
    return [
      ...base,
      {
        id: "verified",
        at: "2026-08-09",
        title: { en: "Verification complete", hi: "जाँच पूरी", hinglish: "Verification complete" },
        detail: { en: "Checks matched this profile.", hi: "जाँच इस प्रोफ़ाइल से मेल खाई।", hinglish: "Checks is profile se match hue." },
        meaning: { en: "JANMARG did not sanction the scholarship.", hi: "JANMARG ने स्वीकृति नहीं दी।", hinglish: "JANMARG ne sanction nahi kiya." },
        next: { en: "Payment status is a gateway row, not a transfer.", hi: "भुगतान स्थिति हस्तांतरण नहीं है।", hinglish: "Payment status transfer nahi hai." },
        synthetic: true,
      },
      {
        id: "pay",
        at: "2026-08-14",
        current: true,
        title: {
          en: data.scenario === "payment_pending" ? "Payment pending" : "Payment initiated",
          hi: data.scenario === "payment_pending" ? "भुगतान लंबित" : "भुगतान शुरू",
          hinglish: data.scenario === "payment_pending" ? "Payment pending" : "Payment initiated",
        },
        detail: { en: "Payment gateway row only.", hi: "केवल भुगतान स्थिति।", hinglish: "Sirf payment status." },
        meaning: { en: "No money was sent.", hi: "कोई पैसा नहीं भेजा गया।", hinglish: "Koi paisa nahi bheja gaya." },
        next: { en: "Confirm later on the official channel.", hi: "आधिकारिक माध्यम पर बाद में पुष्टि करें।", hinglish: "Official channel par baad mein confirm karo." },
        synthetic: true,
      },
    ];
  }
  const events = [
    ...base,
    {
      id: "verify",
      at: "2026-08-09",
      title: { en: "Verification started", hi: "जाँच शुरू", hinglish: "Verification start" },
      detail: { en: "Verification compared the names.", hi: "जाँच ने नाम मिलाया।", hinglish: "Verification ne naam compare kiya." },
      meaning: { en: "A difference was found. It is not a rejection.", hi: "अंतर मिला। यह अस्वीकृति नहीं है।", hinglish: "Farq mila. Yeh rejection nahi hai." },
      next: { en: "Open VerifyOnce.", hi: "VerifyOnce खोलें।", hinglish: "VerifyOnce kholo." },
      synthetic: true,
    },
    {
      id: "deficiency",
      at: "2026-08-09",
      current: !data.reviewSubmitted,
      title: { en: "Deficiency detected", hi: "कमी मिली", hinglish: "Deficiency detect hui" },
      detail: { en: "Income certificate name differs from the profile.", hi: "आय प्रमाण का नाम प्रोफ़ाइल से अलग है।", hinglish: "Income certificate ka naam profile se alag hai." },
      meaning: { en: "Name mismatch — Action Needed.", hi: "नाम मेल नहीं — ज़रूरी काम।", hinglish: "Name mismatch — Action Needed." },
      next: { en: "Add a clarification for officer review.", hi: "अधिकारी समीक्षा के लिए स्पष्टीकरण दें।", hinglish: "Officer review ke liye clarification do." },
      synthetic: true,
    },
  ];
  if (data.reviewSubmitted) {
    events.push({
      id: "clarified",
      at: "2026-08-10",
      current: true,
      title: { en: "Clarification submitted", hi: "स्पष्टीकरण जमा", hinglish: "Clarification submit ho gaya" },
      detail: { en: "Waiting for officer review.", hi: "अधिकारी समीक्षा की प्रतीक्षा।", hinglish: "Officer review ka wait." },
      meaning: { en: "JANMARG has not made a final decision.", hi: "JANMARG ने अंतिम निर्णय नहीं लिया।", hinglish: "JANMARG ne final decision nahi liya." },
      next: { en: "You can still read the timeline.", hi: "आप समयरेखा पढ़ सकते हैं।", hinglish: "Timeline ab bhi padh sakte ho." },
      synthetic: true,
    });
  } else {
    events.push({
      id: "wait",
      at: "—",
      title: { en: "Clarification submitted", hi: "स्पष्टीकरण जमा", hinglish: "Clarification submitted" },
      detail: { en: "Pending — you have not sent it yet.", hi: "अभी तक नहीं भेजा।", hinglish: "Abhi tak nahi bheja." },
      meaning: { en: "The file stays at Deficiency Resolution.", hi: "फ़ाइल कमी समाधान पर है।", hinglish: "File Deficiency Resolution par hai." },
      next: { en: "Resolve the deficiency.", hi: "कमी हल करें।", hinglish: "Deficiency resolve karo." },
      synthetic: true,
    });
  }
  events.push({
    id: "payrow",
    at: "2026-08-14",
    title: { en: "Payment initiated", hi: "भुगतान शुरू", hinglish: "Payment initiated" },
    detail: { en: "Awaiting confirmation.", hi: "पुष्टि बाकी है।", hinglish: "Confirmation baaki hai." },
    meaning: { en: "Payment status only. Confirm on the official channel.", hi: "स्थिति। आधिकारिक माध्यम पर जाँचें।", hinglish: "Status. Official channel par verify karo." },
    next: { en: "Open the payment page.", hi: "भुगतान पृष्ठ खोलें।", hinglish: "Payment page kholo." },
    synthetic: true,
  });
  return events;
}

export function stageLabel(data: ShowcaseData): Pack {
  if (data.scenario === "missing_income_doc") {
    return { en: "Needs Information", hi: "जानकारी चाहिए", hinglish: "Needs Information" };
  }
  if (data.scenario === "happy_path") {
    return { en: "Verification complete", hi: "जाँच पूरी", hinglish: "Verification complete" };
  }
  if (data.scenario === "payment_pending") {
    return { en: "Payment pending", hi: "भुगतान लंबित", hinglish: "Payment pending" };
  }
  if (data.scenario === "source_unavailable") {
    return { en: "Saved status", hi: "केवल सहेजी स्थिति", hinglish: "Saved status" };
  }
  return data.reviewSubmitted
    ? { en: "Awaiting manual review", hi: "समीक्षा की प्रतीक्षा", hinglish: "Manual review ka wait" }
    : { en: "Deficiency Resolution", hi: "कमी समाधान", hinglish: "Deficiency Resolution" };
}

export function eligibilityDecision(data: ShowcaseData, code: SchemeCode): "eligible" | "possibly" | "needs" | "not" {
  if (data.role === "guardian") {
    if (code === "pre-matric") return "possibly";
    if (code === "post-matric" || code === "top-class") return "not";
    return "needs";
  }
  if (code === "pre-matric") return "not";
  if (code === "top-class") return "needs";
  if (code === "nfst" || code === "nos") return "needs";
  if (data.scenario === "missing_income_doc") return "needs";
  return "possibly";
}

export const KNOWLEDGE = [
  {
    id: "pm-income",
    title: "Post-Matric Scholarship Scheme — income line",
    url: "https://tribal.nic.in/scholarship.aspx",
    reviewed: "2026-09-30",
    excerpt: "Parental income from all sources should not exceed Rs.2.50 lakhs per annum.",
  },
  {
    id: "pre-class",
    title: "Pre-Matric Scholarship — classes",
    url: "https://tribal.nic.in/scholarship.aspx",
    reviewed: "2026-09-30",
    excerpt: "Applicable to students who are studying in Classes IX–X. Parental income should not exceed Rs.2.50 lakhs per annum.",
  },
  {
    id: "top",
    title: "Top Class / National Scholarship — income line",
    url: "https://tribal.nic.in/scholarship.aspx",
    reviewed: "2026-09-30",
    excerpt: "Family income from all sources should not exceed Rs.6.00 lakhs per annum. Apply on the National Scholarship Portal.",
  },
  {
    id: "nfst",
    title: "National Tribal Fellowship Portal",
    url: "https://fellowship.tribal.gov.in/",
    reviewed: "2026-09-30",
    excerpt: "Every year 750 fresh ST students are given fellowship. The portal fetches documents from Digital Locker.",
  },
  {
    id: "nos",
    title: "National Overseas Scholarship Portal",
    url: "https://overseas.tribal.gov.in/",
    reviewed: "2026-09-30",
    excerpt: "Every year 20 fresh ST students are given scholarship for Master, Ph.D, and Post-Doctoral courses abroad.",
  },
  {
    id: "dbt",
    title: "MoTA Direct Benefit Transfer portal",
    url: "https://dbttribal.gov.in/",
    reviewed: "2026-09-30",
    excerpt: "PFMS acts as the common platform for DBT. Benefit is transferred to bank accounts by the paying system, not by a student app.",
  },
  {
    id: "locker",
    title: "DigiLocker",
    url: "https://www.digilocker.gov.in/",
    reviewed: "2026-09-30",
    excerpt: "DigiLocker is a secure cloud platform for storage, sharing and verification of documents. Partner access is for issuers and requesters.",
  },
  {
    id: "nsp",
    title: "National Scholarship Portal — students",
    url: "https://scholarships.gov.in/Students",
    reviewed: "2026-09-30",
    excerpt: "One Time Registration is required to apply for scholarships on the National Scholarship Portal.",
  },
] as const;

const ALLOWED = new Set(KNOWLEDGE.map((item) => new URL(item.url).host));

export function allowedHost(url: string): boolean {
  try {
    return ALLOWED.has(new URL(url).host);
  } catch {
    return false;
  }
}

export function localAnswer(question: string, data: ShowcaseData): ChatTurn {
  const q = question.toLowerCase();
  const file =
    /delay|mismatch|naam|name|kyun|why|status|application|kya karna|what should/.test(q) &&
    !/income limit|2\.50|kitni income|eligibility rule/.test(q);
  if (data.scenario === "source_unavailable" && /payment|status|delay/.test(q)) {
    return {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: "Latest status is unavailable. The saved file is still here. This is not a live ministry status.",
      citations: [],
      fileBased: true,
      actions: [
        { label: "View saved timeline", to: `/applications/${APP_REF}` },
        { label: "Request manual review", to: `/applications/${APP_REF}/resolve` },
      ],
    };
  }
  if (file || /mismatch|kumari/.test(q)) {
    const mismatch = data.scenario === "name_mismatch";
    return {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: mismatch
        ? "Your Post-Matric application is at Deficiency Resolution because the income certificate shows ‘Asha Kumari Munda’ while your profile shows ‘Asha Munda’. This is a clarification request, not a rejection. You can submit a short clarification or request officer review."
        : `Your file is at “${stageLabel(data).en}”. This is a status on JANMARG, not a ministry decision.`,
      citations: file ? [] : [],
      fileBased: true,
      actions: [
        { label: "Resolve mismatch", to: "/verify-once" },
        { label: "Request manual review", to: `/applications/${APP_REF}/resolve` },
        { label: "View timeline", to: `/applications/${APP_REF}` },
      ],
    };
  }
  if (/payment|dbt|paisa|paid/.test(q)) {
    return {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: "The payment row says payment initiated and still awaiting confirmation. JANMARG did not send money and is not connected to PFMS. Confirm the final status only on the official channel.",
      citations: [KNOWLEDGE[5]],
      fileBased: true,
      actions: [{ label: "Open payment status", to: "/payments" }],
    };
  }
  if (/document|dastavej|certificate|kaun se/.test(q)) {
    return {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: "For this Post-Matric file the passport holds an ST certificate, an income certificate, a college bonafide, a masked bank record, a marksheet, and a masked identity record. The income certificate needs a name clarification.",
      citations: [KNOWLEDGE[0]],
      fileBased: true,
      actions: [{ label: "Open Document Passport", to: "/documents" }],
    };
  }
  if (/eligib|layak|2\.50|income limit|post-matric/.test(q)) {
    return {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: "On the ministry scholarship page, Post-Matric parental income from all sources should not exceed Rs.2.50 lakh per year. Asha’s file is Possibly Eligible. That is guidance from a versioned rule, not a government decision. The name mismatch still needs clarification.",
      citations: [KNOWLEDGE[0]],
      fileBased: false,
      actions: [{ label: "See eligibility", to: "/eligibility/post-matric" }],
    };
  }
  if (/pre-matric|class 9|class ix|नौ/.test(q)) {
    return {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: "The ministry page says Pre-Matric applies to Classes IX and X, with the same Rs.2.50 lakh parental income line. Asha is in B.A. first year, so this scheme is not for her current class. The parent desk explores that flow.",
      citations: [KNOWLEDGE[1]],
      fileBased: false,
      actions: [{ label: "Open Pre-Matric", to: "/schemes/pre-matric" }],
    };
  }
  if (/top class|institute/.test(q)) {
    return {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: "Top Class support is for notified institutes, and the ministry page states a family income cap of Rs.6.00 lakh. Asha’s college is not confirmed on a notified list on this file, so the result is Needs Information.",
      citations: [KNOWLEDGE[2]],
      fileBased: false,
      actions: [{ label: "Check Top Class", to: "/eligibility/top-class" }],
    };
  }
  if (/fellowship|nfst|750/.test(q)) {
    return {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: "The National Tribal Fellowship Portal says 750 fresh fellowships are given each year and that the portal can fetch Digital Locker documents. This app does not file an NFST application.",
      citations: [KNOWLEDGE[3]],
      fileBased: false,
      actions: [{ label: "Read NFST card", to: "/schemes/nfst" }],
    };
  }
  if (/overseas|nos|abroad/.test(q)) {
    return {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: "The NOS portal says 20 fresh awards a year for Master, Ph.D, and post-doctoral study abroad. This screen only shows that information. It does not submit an overseas application.",
      citations: [KNOWLEDGE[4]],
      fileBased: false,
      actions: [{ label: "Read NOS card", to: "/schemes/nos" }],
    };
  }
  if (/digilocker|locker/.test(q)) {
    return {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: "DigiLocker is a document wallet run under Digital India. A student app cannot pull documents unless it is an approved requester. The import here is not a live DigiLocker session.",
      citations: [KNOWLEDGE[6]],
      fileBased: false,
      actions: [{ label: "Open passport", to: "/documents" }],
    };
  }
  return {
    id: `a-${Date.now()}`,
    role: "assistant",
    text: JAGO_FALLBACK,
    citations: [],
    fileBased: false,
    actions: [
      { label: "Official scholarship page", to: "/about" },
      { label: "Request manual review", to: "/manual-review" },
    ],
  };
}

export function notifications(data: ShowcaseData): { id: string; priority: string; title: string; body: string; to: string }[] {
  const items = [
    {
      id: "n1",
      priority: "Action Required",
      title: "Action needed: clarify name mismatch in Income Certificate.",
      body: "Profile ‘Asha Munda’ and certificate ‘Asha Kumari Munda’.",
      to: "/verify-once",
    },
    {
      id: "n2",
      priority: "Payment Updates",
      title: "Payment status updated: payment initiated.",
      body: "Awaiting confirmation. This is not a transfer.",
      to: "/payments",
    },
    {
      id: "n3",
      priority: "Document Reminders",
      title: "Your Income Certificate is nearing review/renewal date.",
      body: "Review date 2 Nov 2026.",
      to: "/documents/income",
    },
    {
      id: "n4",
      priority: "General Information",
      title: "Top Class Education Scheme readiness check is available.",
      body: "Institute confirmation is still needed.",
      to: "/schemes/top-class",
    },
  ];
  if (data.reviewSubmitted) {
    items.unshift({
      id: "n0",
      priority: "Application Updates",
      title: "Clarification submitted for manual review.",
      body: "JANMARG has not made a final decision.",
      to: `/applications/${APP_REF}`,
    });
  }
  if (data.scenario === "missing_income_doc") {
    items[0] = {
      id: "n1",
      priority: "Action Required",
      title: "Income certificate is missing from the passport.",
      body: "Add it before the file can move forward.",
      to: "/documents",
    };
  }
  if (data.scenario === "happy_path" || data.scenario === "payment_pending") {
    items[0] = {
      id: "n1",
      priority: "Application Updates",
      title: "No open mismatch on this file.",
      body: "Payment row is not a transfer.",
      to: "/payments",
    };
  }
  return items;
}

export const ADAPTERS: { name: string; mode: string; health: string; ms: number }[] = [
  { name: "DigiLocker", mode: "GATEWAY", health: "HEALTHY", ms: 180 },
  { name: "NSP", mode: "GATEWAY", health: "HEALTHY", ms: 220 },
  { name: "PFMS", mode: "GATEWAY", health: "DEGRADED", ms: 640 },
  { name: "NFST", mode: "GATEWAY", health: "HEALTHY", ms: 200 },
  { name: "NOS", mode: "GATEWAY", health: "HEALTHY", ms: 210 },
  { name: "APAAR", mode: "GATEWAY", health: "HEALTHY", ms: 190 },
  { name: "UDISE+", mode: "GATEWAY", health: "UNAVAILABLE", ms: 0 },
  { name: "AISHE", mode: "GATEWAY", health: "HEALTHY", ms: 240 },
  { name: "Canara SFMP", mode: "GATEWAY", health: "HEALTHY", ms: 260 },
];
