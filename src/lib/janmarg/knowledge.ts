import type { KnowledgeCitation, Lang } from "./types.ts";

export type KnowledgeChunk = {
  id: string;
  lang: Lang;
  title: string;
  body: string;
  next: string;
  source: string;
  url: string;
  keywords: string[];
};

const SOURCE = "Ministry of Tribal Affairs — demo extract";
const URL = "https://tribal.nic.in/ScholarshiP.aspx";

export const KNOWLEDGE: KnowledgeChunk[] = [
  {
    id: "pms-income",
    lang: "en",
    title: "Post-Matric income ceiling",
    body: "For Post-Matric Scholarship for ST students, this demo extract uses a family income ceiling of ₹2.5 lakh a year. Study runs from Class 11 to post-graduation in a recognised institution. A student is generally not meant to hold another central scholarship at the same time. This extract does not sanction an award.",
    next: "Open your Post-Matric match and read each check.",
    source: SOURCE,
    url: URL,
    keywords: ["income", "limit", "ceiling", "2.5", "lakh", "post-matric", "post matric"],
  },
  {
    id: "pms-income-hi",
    lang: "hi",
    title: "पोस्ट-मैट्रिक आय सीमा",
    body: "अनुसूचित जनजाति के छात्रों की पोस्ट-मैट्रिक छात्रवृत्ति के लिए इस डेमो अंश में परिवार की आय सीमा ₹2.5 लाख प्रति वर्ष है। पढ़ाई कक्षा 11 से स्नातकोत्तर तक मान्यता प्राप्त संस्थान में होनी चाहिए। आम तौर पर एक ही समय पर दूसरी केंद्रीय छात्रवृत्ति नहीं ली जाती। यह अंश कोई स्वीकृति नहीं है।",
    next: "अपना पोस्ट-मैट्रिक मिलान खोलें और हर जाँच पढ़ें।",
    source: SOURCE,
    url: URL,
    keywords: ["आय", "सीमा", "पोस्ट-मैट्रिक", "लाख", "2.5"],
  },
  {
    id: "pms-expired",
    lang: "en",
    title: "Expired income certificate",
    body: "If your income certificate is out of date, do not submit the Post-Matric file yet. Renew the certificate, then check the match again. An expired certificate is missing evidence. By itself it is not a rejection.",
    next: "Open the document passport and replace the income certificate.",
    source: SOURCE,
    url: URL,
    keywords: ["expired", "income certificate", "out of date", "renew", "deficiency"],
  },
  {
    id: "pms-expired-hi",
    lang: "hi",
    title: "आय प्रमाण पत्र पुराना है",
    body: "अगर आय प्रमाण पत्र की अवधि निकल गई है, तो पोस्ट-मैट्रिक फ़ाइल अभी न भेजें। नया प्रमाण पत्र रखें, फिर मिलान दोबारा देखें। पुराना पत्र प्रमाण की कमी है। अपने आप में यह अस्वीकृति नहीं है।",
    next: "दस्तावेज़ पासपोर्ट खोलें और आय प्रमाण पत्र बदलें।",
    source: SOURCE,
    url: URL,
    keywords: ["पुराना", "आय प्रमाण", "नवीनीकरण", "अवधि"],
  },
  {
    id: "top-class",
    lang: "en",
    title: "Top Class education scheme",
    body: "In this demo extract, Top Class is for ST students in graduate or postgraduate courses at notified institutes. The family income ceiling used here is ₹6 lakh a year. The published list has 265 institutes. This demo keeps only a small sample. A fit is not a promise of funds.",
    next: "Check the Top Class match and see if your institute is in the sample.",
    source: SOURCE,
    url: URL,
    keywords: ["top class", "top-class", "6 lakh", "notified", "institute", "iit"],
  },
  {
    id: "top-class-hi",
    lang: "hi",
    title: "टॉप क्लास शिक्षा योजना",
    body: "इस डेमो अंश में टॉप क्लास उन अनुसूचित जनजाति छात्रों के लिए है जो अधिसूचित संस्थानों में स्नातक या स्नातकोत्तर पढ़ रहे हैं। यहाँ परिवार की आय सीमा ₹6 लाख प्रति वर्ष है। प्रकाशित सूची में 265 संस्थान हैं। इस डेमो में केवल एक छोटा नमूना है। मेल का मतलब धन का वादा नहीं है।",
    next: "टॉप क्लास मिलान देखें और जाँचें कि संस्थान नमूने में है या नहीं।",
    source: SOURCE,
    url: URL,
    keywords: ["टॉप क्लास", "संस्थान", "6 लाख", "अधिसूचित"],
  },
  {
    id: "nos",
    lang: "en",
    title: "Overseas scholarship readiness",
    body: "National Overseas Scholarship is competitive and has limited slots. Readiness needs evidence of admission or an offer from a foreign university, along with the other published conditions. A readiness match is not a selection. Only the competent authority can decide.",
    next: "Open the overseas readiness list and see which proof is missing.",
    source: SOURCE,
    url: URL,
    keywords: ["overseas", "abroad", "offer", "admission", "foreign", "readiness", "nos", "slots"],
  },
  {
    id: "nos-hi",
    lang: "hi",
    title: "विदेशी छात्रवृत्ति की तैयारी",
    body: "राष्ट्रीय विदेशी छात्रवृत्ति प्रतियोगी है और सीटें सीमित हैं। तैयारी के लिए विदेशी विश्वविद्यालय का दाखिला या प्रस्ताव पत्र और अन्य प्रकाशित शर्तें चाहिए। तैयारी का मेल चयन नहीं है। निर्णय केवल सक्षम प्राधिकारी कर सकता है।",
    next: "विदेशी तैयारी सूची खोलें और देखें कौन सा प्रमाण बाकी है।",
    source: SOURCE,
    url: URL,
    keywords: ["विदेश", "प्रस्ताव", "दाखिला", "तैयारी", "सीट"],
  },
  {
    id: "funds",
    lang: "en",
    title: "A match is not a payment",
    body: "A likely match only means the demo rules fit so far. It is not a sanction and not a payment. This desk cannot send money. The implementing agency is the final authority.",
    next: "Read your match result, the rule version, and the authority note.",
    source: SOURCE,
    url: URL,
    keywords: ["money", "funds", "payment", "receive", "sanction", "guarantee", "will i get"],
  },
  {
    id: "funds-hi",
    lang: "hi",
    title: "मेल का मतलब भुगतान नहीं",
    body: "संभावित मेल का मतलब केवल इतना है कि डेमो नियम अभी तक पूरे लगते हैं। यह संस्वीकृति नहीं है और भुगतान नहीं है। यह डेस्क पैसा नहीं भेज सकता। अंतिम अधिकार लागू करने वाली संस्था का है।",
    next: "अपना मिलान, नियम संस्करण और अधिकार नोट पढ़ें।",
    source: SOURCE,
    url: URL,
    keywords: ["पैसा", "भुगतान", "मिलेगा", "धन", "गारंटी"],
  },
  {
    id: "mismatch",
    lang: "en",
    title: "Name mismatch",
    body: "If the marksheet name and the profile name differ, institute verification can pause the file. See which source gave each name. Extra spaces can be cleaned up. A real spelling difference needs a correction, or a person to review it. This demo does not decide the file.",
    next: "Open the verification centre and compare the names.",
    source: SOURCE,
    url: URL,
    keywords: ["name", "mismatch", "marksheet", "spelling", "different"],
  },
  {
    id: "mismatch-hi",
    lang: "hi",
    title: "नाम मेल नहीं खाता",
    body: "अगर अंकपत्र का नाम और प्रोफ़ाइल का नाम अलग है, तो संस्थान सत्यापन फ़ाइल रोक सकता है। देखें हर नाम किस स्रोत से आया। अतिरिक्त स्पेस साफ हो सकते हैं। असली वर्तनी के अंतर के लिए सुधार चाहिए, या किसी व्यक्ति की समीक्षा। यह डेमो फ़ाइल का फैसला नहीं करता।",
    next: "सत्यापन केंद्र खोलें और नामों की तुलना करें।",
    source: SOURCE,
    url: URL,
    keywords: ["नाम", "अंकपत्र", "मेल नहीं", "वर्तनी"],
  },
  {
    id: "pre",
    lang: "en",
    title: "Pre-Matric scholarship",
    body: "In this demo extract, Pre-Matric support is for ST students in Class 9 and Class 10, with a family income ceiling of ₹2.5 lakh a year. Class 11 and above sits with Post-Matric, not Pre-Matric. This demo does not submit Pre-Matric applications.",
    next: "Check the Pre-Matric match to see if your class fits.",
    source: SOURCE,
    url: URL,
    keywords: ["pre-matric", "pre matric", "class 9", "class 10"],
  },
  {
    id: "pre-hi",
    lang: "hi",
    title: "प्री-मैट्रिक छात्रवृत्ति",
    body: "इस डेमो अंश में प्री-मैट्रिक सहायता कक्षा 9 और 10 के अनुसूचित जनजाति छात्रों के लिए है, आय सीमा ₹2.5 लाख प्रति वर्ष। कक्षा 11 और आगे पोस्ट-मैट्रिक में आता है। यह डेमो प्री-मैट्रिक आवेदन जमा नहीं करता।",
    next: "प्री-मैट्रिक मिलान देखें कि कक्षा मेल खाती है या नहीं।",
    source: SOURCE,
    url: URL,
    keywords: ["प्री-मैट्रिक", "कक्षा 9", "कक्षा 10"],
  },
  {
    id: "nfst",
    lang: "en",
    title: "National Fellowship",
    body: "The National Fellowship in this extract is for ST students in MPhil or PhD. It is selection-based. This demo can explain the fit. It does not process fellowship applications or promise a fellowship.",
    next: "Check the fellowship match. If you are not in MPhil or PhD, it will not match.",
    source: SOURCE,
    url: URL,
    keywords: ["fellowship", "nfst", "mphil", "phd", "research"],
  },
  {
    id: "nfst-hi",
    lang: "hi",
    title: "राष्ट्रीय फेलोशिप",
    body: "इस अंश में राष्ट्रीय फेलोशिप एमफिल या पीएचडी कर रहे अनुसूचित जनजाति छात्रों के लिए है। यह चयन आधारित है। यह डेमो मेल समझा सकता है। यह फेलोशिप आवेदन आगे नहीं बढ़ाता और फेलोशिप का वादा नहीं करता।",
    next: "फेलोशिप मिलान देखें। अगर आप एमफिल या पीएचडी में नहीं हैं, तो मेल नहीं होगा।",
    source: SOURCE,
    url: URL,
    keywords: ["फेलोशिप", "एमफिल", "पीएचडी", "शोध"],
  },
  {
    id: "documents",
    lang: "en",
    title: "Documents you may need",
    body: "Schemes commonly ask for an ST certificate, an income certificate, a marksheet, and proof of admission. Top Class may also ask for an institute certificate. Overseas readiness needs passport evidence and an admission offer. Reuse a stored copy only when it is still valid and you have allowed reuse.",
    next: "Open the document passport to see what is current, expired, or missing.",
    source: SOURCE,
    url: URL,
    keywords: ["documents", "certificate", "marksheet", "passport", "required", "what do i need"],
  },
  {
    id: "documents-hi",
    lang: "hi",
    title: "जो दस्तावेज़ मांगे जा सकते हैं",
    body: "योजनाएँ अक्सर जनजाति प्रमाण पत्र, आय प्रमाण पत्र, अंकपत्र और दाखिले का प्रमाण माँगती हैं। टॉप क्लास संस्थान प्रमाण भी माँग सकती है। विदेशी तैयारी के लिए पासपोर्ट प्रमाण और दाखिला प्रस्ताव चाहिए। सहेजी प्रति तभी दोबारा उपयोग करें जब वह वैध हो और आपने अनुमति दी हो।",
    next: "दस्तावेज़ पासपोर्ट खोलें और देखें क्या चालू है, पुराना है, या नहीं है।",
    source: SOURCE,
    url: URL,
    keywords: ["दस्तावेज़", "प्रमाण पत्र", "अंकपत्र", "पासपोर्ट"],
  },
  {
    id: "portals",
    lang: "en",
    title: "Where the three public portals stand",
    body: "National Scholarship Portal (scholarships.gov.in) is run by MeitY and uses one-time registration. National Overseas Scholarship for ST students is a separate NIC site at overseas.tribal.gov.in. Its public page, read on 29 Sep 2026, says 20 awards a year and a family income ceiling of ₹6 lakh. Canara SFMP (scholarship.canarabank.bank.in) opens as a scholar login. This account is not signed into any of those sites. Reading a public page is not a live student-file sync.",
    next: "Open Settings and read the portal list. Nothing there is a live login.",
    source: "Public pages, read 29 Sep 2026",
    url: "https://scholarships.gov.in/",
    keywords: ["nsp", "portal", "sfmp", "canara", "overseas portal", "synchron", "sync", "live"],
  },
  {
    id: "portals-hi",
    lang: "hi",
    title: "तीन सार्वजनिक पोर्टल कहाँ हैं",
    body: "नेशनल स्कॉलरशिप पोर्टल (scholarships.gov.in) MeitY चलाता है और वन-टाइम रजिस्ट्रेशन माँगता है। अनुसूचित जनजाति की राष्ट्रीय विदेशी छात्रवृत्ति अलग NIC साइट overseas.tribal.gov.in पर है। 29 सितंबर 2026 को पढ़े सार्वजनिक पन्ने पर साल में 20 पुरस्कार और परिवार की आय सीमा ₹6 लाख लिखी है। केनरा SFMP (scholarship.canarabank.bank.in) विद्वान लॉगिन खोलता है। यह खाता इनमें से किसी में साइन इन नहीं है। सार्वजनिक पन्ना पढ़ना लाइव छात्र-फ़ाइल सिंक नहीं है।",
    next: "सेटिंग खोलें और पोर्टल सूची पढ़ें। वहाँ कोई लाइव लॉगिन नहीं है।",
    source: "सार्वजनिक पन्ने, 29 सितंबर 2026",
    url: "https://overseas.tribal.gov.in/",
    keywords: ["पोर्टल", "एनएसपी", "कैनरा", "सिंक", "लाइव", "विदेशी पोर्टल"],
  },
  {
    id: "locker",
    lang: "en",
    title: "DigiLocker is refused without a partner client",
    body: "DigiLocker sign-in is OAuth with PKCE. It needs a partner client issued to this product. No client id and no client secret are configured, so the connection is refused before any request is sent. Documents on this desk are records you add or labelled mocks. Do not type an Aadhaar number here.",
    next: "Use your document passport. A refused connector is not a failed application.",
    source: "DigiLocker public site, not a partner session",
    url: "https://www.digilocker.gov.in/",
    keywords: ["digilocker", "locker", "oauth", "aadhaar", "sign in", "connect"],
  },
  {
    id: "locker-hi",
    lang: "hi",
    title: "DigiLocker बिना पार्टनर क्लाइंट के मना है",
    body: "DigiLocker साइन-इन OAuth और PKCE है। इसके लिए इस उत्पाद को जारी पार्टनर क्लाइंट चाहिए। कोई क्लाइंट आईडी और कोई सीक्रेट सेट नहीं है, इसलिए अनुरोध भेजने से पहले कनेक्शन मना कर दिया जाता है। इस डेस्क के दस्तावेज़ वे रिकॉर्ड हैं जो आप जोड़ते हैं, या चिह्नित मॉक। यहाँ आधार नंबर न लिखें।",
    next: "अपना दस्तावेज़ पासपोर्ट इस्तेमाल करें। मना कनेक्टर असफल आवेदन नहीं है।",
    source: "DigiLocker सार्वजनिक साइट, पार्टनर सत्र नहीं",
    url: "https://www.digilocker.gov.in/",
    keywords: ["डिजिलॉकर", "लॉकर", "आधार", "कनेक्ट", "साइन"],
  },
];

const STOP = new Set([
  "what", "is", "the", "for", "my", "if", "a", "of", "to", "does", "do", "i", "will", "get",
  "me", "and", "or", "in", "on", "your", "you", "how", "should", "when", "this", "that",
  "क्या", "है", "के", "की", "में", "और", "से", "को", "का", "एक", "यह", "अगर",
]);

function tokens(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s.-]/gu, " ")
    .split(/\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 1 && !STOP.has(part));
}

export function searchKnowledge(query: string, lang: Lang, chunks: KnowledgeChunk[] = KNOWLEDGE) {
  const raw = query.toLowerCase();
  const qTokens = tokens(query);
  return chunks
    .filter((chunk) => chunk.lang === lang)
    .map((chunk) => {
      const hay = new Set(tokens(`${chunk.title} ${chunk.body} ${chunk.keywords.join(" ")}`));
      const hit = qTokens.length === 0 ? 0 : qTokens.filter((token) => hay.has(token)).length;
      let score = qTokens.length === 0 ? 0 : hit / qTokens.length;
      for (const keyword of chunk.keywords) {
        if (keyword.length > 2 && raw.includes(keyword.toLowerCase())) score += 0.28;
      }
      return { chunk, score };
    })
    .sort((a, b) => b.score - a.score);
}

export function answerQuestion(query: string, lang: Lang, chunks: KnowledgeChunk[] = KNOWLEDGE) {
  const ranked = searchKnowledge(query, lang, chunks);
  const best = ranked[0];
  const second = ranked[1];
  const margin = best && second ? best.score - second.score : best?.score ?? 0;
  const confident = Boolean(best && best.score >= 0.55 && (margin >= 0.12 || best.score >= 0.9));
  if (!best || !confident) {
    return {
      confident: false,
      text: null as string | null,
      nextAction: null as string | null,
      citations: [] as KnowledgeCitation[],
    };
  }
  return {
    confident: true,
    text: best.chunk.body,
    nextAction: best.chunk.next,
    citations: [
      {
        id: best.chunk.id,
        title: best.chunk.title,
        source: best.chunk.source,
        url: best.chunk.url,
      },
    ] as KnowledgeCitation[],
  };
}
