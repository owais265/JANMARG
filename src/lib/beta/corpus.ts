/** Reviewed public notes. Facts are dated to the ministry page read on 2026-09-30. */

export const CORPUS_VERSION = "2026-09-30.2";

export const MOTA_PAGE = "https://tribal.nic.in/scholarship.aspx";
export const NSP_PAGE = "https://scholarships.gov.in/";
export const FELLOWSHIP_PAGE = "https://fellowship.tribal.gov.in/";
export const OVERSEAS_PAGE = "https://overseas.tribal.gov.in/";
export const DBT_PAGE = "https://dbttribal.gov.in/";
export const TOP_CLASS_LIST =
  "https://tribal.nic.in/downloads/guidelines/Top-Class/Revised265TopClassInstitutesList2023-24till15032024.pdf";
export const NOS_DIGILOCKER =
  "https://tribal.nic.in/downloads/faqs/DigiLocker-User-Manual_NOS.pdf";

export type Passage = {
  id: string;
  scheme: string;
  topic: string;
  lang: "en" | "hi";
  title: string;
  body: string;
  sourceTitle: string;
  sourceUrl: string;
  reviewedOn: string;
  keywords: string;
};

const REVIEWED = "2026-09-30";
const MOTA = "Ministry of Tribal Affairs — scholarship page";

function pair(
  id: string,
  scheme: string,
  topic: string,
  titleEn: string,
  bodyEn: string,
  titleHi: string,
  bodyHi: string,
  sourceTitle: string,
  sourceUrl: string,
  keywords: string,
): Passage[] {
  return [
    {
      id: `${id}-en`,
      scheme,
      topic,
      lang: "en",
      title: titleEn,
      body: bodyEn,
      sourceTitle,
      sourceUrl,
      reviewedOn: REVIEWED,
      keywords,
    },
    {
      id: `${id}-hi`,
      scheme,
      topic,
      lang: "hi",
      title: titleHi,
      body: bodyHi,
      sourceTitle,
      sourceUrl,
      reviewedOn: REVIEWED,
      keywords,
    },
  ];
}

export const PASSAGES: Passage[] = [
  ...pair(
    "choose",
    "all",
    "explore",
    "Which scheme to read first",
    "Start from the class you are in. Class 9 and 10 readers usually open Pre-Matric. From Class 11 through college, readers usually open Post-Matric. Higher study at a notified institute is the Top Class page. MPhil or PhD is the National Fellowship page. Study outside India is the National Overseas page. This matching is only a reading order. It is not a selection.",
    "पहले कौन सी योजना पढ़ें",
    "जिस कक्षा में आप हैं, वहीं से शुरू करें। कक्षा 9 और 10 वाले आमतौर पर प्री-मैट्रिक खोलते हैं। कक्षा 11 से कॉलेज तक वाले पोस्ट-मैट्रिक। अधिसूचित संस्थान की उच्च पढ़ाई टॉप क्लास पृष्ठ है। एमफिल या पीएचडी राष्ट्रीय फेलोशिप पृष्ठ है। भारत के बाहर पढ़ाई राष्ट्रीय प्रवासी छात्रवृत्ति पृष्ठ है। यह केवल पढ़ने का क्रम है, चयन नहीं।",
    MOTA,
    MOTA_PAGE,
    "scheme explore which योजना प्री pre post fellowship overseas class stage kaunsi kaun",
  ),
  ...pair(
    "pre-who",
    "pre-matric",
    "who",
    "Pre-Matric — who the page describes",
    "On the ministry scholarship page reviewed on 30 September 2026, Pre-Matric Scholarship for ST students is described for students studying in Classes IX and X. The scheme is implemented through States and Union Territories. Applications are invited online through the State portal or the National Scholarship Portal. JANMARG does not file this application.",
    "प्री-मैट्रिक — पृष्ठ किसे बताता है",
    "30 सितम्बर 2026 को पढ़े गए मंत्रालय पृष्ठ पर प्री-मैट्रिक छात्रवृत्ति कक्षा 9 और 10 के अनुसूचित जनजाति छात्रों के लिए लिखी है। योजना राज्यों और केंद्रशासित प्रदेशों के माध्यम से चलती है। आवेदन राज्य पोर्टल या राष्ट्रीय छात्रवृत्ति पोर्टल पर ऑनलाइन माँगे जाते हैं। जनमार्ग यह आवेदन नहीं भरता।",
    MOTA,
    MOTA_PAGE,
    "pre-matric pre matric class 9 10 IX X school प्री मैट्रिक कक्षा who prepare",
  ),
  ...pair(
    "pre-income",
    "pre-matric",
    "income",
    "Pre-Matric income line on the ministry page",
    "On that same reviewed page, parental income from all sources for Pre-Matric should not exceed Rs. 2.50 lakh per annum. Confirm the figure on the ministry page before you rely on it. JANMARG does not calculate a final income decision.",
    "प्री-मैट्रिक आय पंक्ति",
    "उसी समीक्षित पृष्ठ पर प्री-मैट्रिक के लिए सभी स्रोतों से माता-पिता की आय Rs. 2.50 लाख प्रति वर्ष से अधिक नहीं होनी चाहिए। भरोसा करने से पहले मंत्रालय पृष्ठ पर अंक जाँचें। जनमार्ग अंतिम आय निर्णय नहीं करता।",
    MOTA,
    MOTA_PAGE,
    "pre-matric income ceiling limit 2.50 lakh parental आय सीमा प्री",
  ),
  ...pair(
    "post-who",
    "post-matric",
    "who",
    "Post-Matric — who the page describes",
    "On the ministry scholarship page reviewed on 30 September 2026, Post-Matric Scholarship for ST students is described for any recognised course whose entry qualification is Matriculation or Class X or above. It is implemented through States and Union Territories. Applications are invited online through the State portal or the National Scholarship Portal. JANMARG does not submit the form.",
    "पोस्ट-मैट्रिक — पृष्ठ किसे बताता है",
    "30 सितम्बर 2026 को पढ़े गए पृष्ठ पर पोस्ट-मैट्रिक उन मान्यता प्राप्त पाठ्यक्रमों के लिए है जिनकी प्रवेश योग्यता मैट्रिक या कक्षा 10 या उससे ऊपर है। योजना राज्यों और केंद्रशासित प्रदेशों के माध्यम से चलती है। आवेदन राज्य पोर्टल या राष्ट्रीय छात्रवृत्ति पोर्टल पर ऑनलाइन होते हैं। जनमार्ग फॉर्म नहीं भेजता।",
    MOTA,
    MOTA_PAGE,
    "post-matric post matric class 11 college course recognised prepare पोस्ट तैयारी",
  ),
  ...pair(
    "post-income",
    "post-matric",
    "income",
    "Post-Matric income line on the ministry page",
    "On that reviewed page, parental income from all sources for Post-Matric should not exceed Rs. 2.50 lakh per annum. The page also says eligibility is checked in the official process and that disbursement is described as DBT to a bank account. JANMARG cannot see that check or that credit.",
    "पोस्ट-मैट्रिक आय पंक्ति",
    "उसी पृष्ठ पर पोस्ट-मैट्रिक के लिए सभी स्रोतों से माता-पिता की आय Rs. 2.50 लाख प्रति वर्ष से अधिक नहीं होनी चाहिए। पृष्ठ कहता है कि पात्रता आधिकारिक प्रक्रिया में जाँची जाती है और वितरण बैंक खाते में डीबीटी के रूप में लिखा है। जनमार्ग वह जाँच या वह जमा नहीं देख सकता।",
    MOTA,
    MOTA_PAGE,
    "post-matric income ceiling 2.50 lakh parental आय सीमा पोस्ट prepare",
  ),
  ...pair(
    "top-who",
    "top-class",
    "who",
    "Top Class — who the page describes",
    "The ministry page describes the National Scholarship (Top Class) for ST students in prescribed courses at identified premier institutes. It says preference is given to girls, Divyang students, and PVTGs. The scheme is described as fully funded by the Central Government. Fresh students apply through the National Scholarship Portal. JANMARG does not confirm an institute seat or an award.",
    "टॉप क्लास — पृष्ठ किसे बताता है",
    "मंत्रालय पृष्ठ अनुसूचित जनजाति छात्रों के लिए चिह्नित प्रमुख संस्थानों के निर्धारित पाठ्यक्रमों में राष्ट्रीय छात्रवृत्ति (टॉप क्लास) बताता है। लड़कियों, दिव्यांग छात्रों और पीवीटीजी को वरीयता लिखी है। योजना केंद्र सरकार द्वारा पूरी तरह वित्तपोषित लिखी है। नए छात्र राष्ट्रीय छात्रवृत्ति पोर्टल पर आवेदन करते हैं। जनमार्ग सीट या पुरस्कार की पुष्टि नहीं करता।",
    MOTA,
    NSP_PAGE,
    "top-class top class premier institute notified girls divyang pvtg scholarships.gov.in टॉप संस्थान",
  ),
  ...pair(
    "top-income",
    "top-class",
    "income",
    "Top Class income line and institute list",
    "On the reviewed ministry page, family income from all sources for this Top Class scholarship should not exceed Rs. 6.00 lakh per annum. A ministry PDF revised for 2023-24 lists 265 identified institutes. That file is a published list, not a live confirmation that an institute is still notified. Open the current ministry page before you rely on a name.",
    "टॉप क्लास आय और संस्थान सूची",
    "समीक्षित पृष्ठ पर इस टॉप क्लास छात्रवृत्ति के लिए परिवार की सभी स्रोतों से आय Rs. 6.00 लाख प्रति वर्ष से अधिक नहीं होनी चाहिए। 2023-24 के लिए संशोधित मंत्रालय पीडीएफ में 265 चिह्नित संस्थान हैं। वह फ़ाइल प्रकाशित सूची है, इस बात की जीवित पुष्टि नहीं कि संस्थान अब भी अधिसूचित है। नाम पर भरोसा करने से पहले वर्तमान मंत्रालय पृष्ठ खोलें।",
    MOTA,
    TOP_CLASS_LIST,
    "top-class income 6.00 lakh 265 institutes list notified टॉप आय संस्थान",
  ),
  ...pair(
    "nfst-who",
    "nfst",
    "who",
    "National Fellowship — who the page describes",
    "On the reviewed ministry page, the National Fellowship for Higher Education of ST students is for MPhil and PhD in specified universities or institutions. It says 750 fresh students are selected each year on merit, with preference to girls, Divyang students, and PVTGs. Selection uses Master degree marks. Applications are online at the fellowship portal. The summary did not state an income ceiling. Read the current guideline before you assume one. JANMARG does not accept fellowship forms.",
    "राष्ट्रीय फेलोशिप — पृष्ठ किसे बताता है",
    "समीक्षित पृष्ठ पर अनुसूचित जनजाति छात्रों की राष्ट्रीय फेलोशिप निर्दिष्ट विश्वविद्यालयों में एमफिल और पीएचडी के लिए है। हर वर्ष योग्यता पर 750 नए छात्र चुनने की बात है, लड़कियों, दिव्यांग और पीवीटीजी को वरीयता के साथ। चयन मास्टर डिग्री अंकों पर है। आवेदन फेलोशिप पोर्टल पर ऑनलाइन है। सार में आय सीमा नहीं लिखी थी। मानने से पहले वर्तमान दिशानिर्देश पढ़ें। जनमार्ग फेलोशिप फॉर्म नहीं लेता।",
    MOTA,
    FELLOWSHIP_PAGE,
    "nfst fellowship mphil phd research 750 merit master फेलोशिप शोध",
  ),
  ...pair(
    "nos-who",
    "nos",
    "who",
    "National Overseas Scholarship — who the page describes",
    "On the reviewed ministry page, the National Overseas Scholarship is for ST students, including PVTGs, for postgraduate, PhD, and post-doctoral study abroad. It says 20 awards are given each year: 17 for STs and 3 for PVTGs. Selection is an interview-based merit list. After selection, the page says a student has 2 years to seek admission. Apply on the overseas portal. JANMARG does not file an overseas application.",
    "राष्ट्रीय प्रवासी छात्रवृत्ति — पृष्ठ किसे बताता है",
    "समीक्षित पृष्ठ पर राष्ट्रीय प्रवासी छात्रवृत्ति अनुसूचित जनजाति छात्रों, सहित पीवीटीजी, के विदेश में स्नातकोत्तर, पीएचडी और पोस्ट-डॉक्टोरल अध्ययन के लिए है। हर वर्ष 20 पुरस्कार लिखे हैं: 17 अनुसूचित जनजाति और 3 पीवीटीजी। चयन साक्षात्कार वाली योग्यता सूची है। चयन के बाद दाखिला खोजने के लिए 2 वर्ष लिखे हैं। आवेदन प्रवासी पोर्टल पर करें। जनमार्ग विदेशी आवेदन नहीं भरता।",
    MOTA,
    OVERSEAS_PAGE,
    "nos overseas abroad foreign study 20 awards 17 3 pvtg interview admission विदेश",
  ),
  ...pair(
    "nos-income",
    "nos",
    "income",
    "Overseas scholarship income line",
    "On that reviewed page, parental or family income from all sources for the National Overseas Scholarship should not exceed Rs. 6.00 lakh per annum. Confirm it on the ministry page. A readiness note here is not a selection.",
    "प्रवासी छात्रवृत्ति की आय पंक्ति",
    "उसी पृष्ठ पर राष्ट्रीय प्रवासी छात्रवृत्ति के लिए माता-पिता या परिवार की सभी स्रोतों से आय Rs. 6.00 लाख प्रति वर्ष से अधिक नहीं होनी चाहिए। मंत्रालय पृष्ठ पर पुष्टि करें। यहाँ की तैयारी टिप्पणी चयन नहीं है।",
    MOTA,
    MOTA_PAGE,
    "nos overseas income 6.00 lakh family parental आय विदेश",
  ),
  ...pair(
    "apply",
    "all",
    "apply",
    "Where an application is actually filed",
    "JANMARG does not submit applications. Pre-Matric and Post-Matric applications are invited on the State portal or the National Scholarship Portal. Top Class fresh applications are described on the National Scholarship Portal. Fellowship applications use the tribal fellowship portal. Overseas applications use the tribal overseas portal. Open the site the scheme names and follow that site's own steps.",
    "आवेदन वास्तव में कहाँ भरते हैं",
    "जनमार्ग आवेदन जमा नहीं करता। प्री-मैट्रिक और पोस्ट-मैट्रिक आवेदन राज्य पोर्टल या राष्ट्रीय छात्रवृत्ति पोर्टल पर माँगे जाते हैं। टॉप क्लास के नए आवेदन राष्ट्रीय छात्रवृत्ति पोर्टल पर लिखे हैं। फेलोशिप जनजातीय फेलोशिप पोर्टल पर है। प्रवासी आवेदन जनजातीय प्रवासी पोर्टल पर है। जिस साइट का नाम योजना ले, वही खोलें और उसके चरण मानें।",
    MOTA,
    NSP_PAGE,
    "apply application portal कैसे आवेदन आवेद submit nsp state official",
  ),
  ...pair(
    "rules",
    "all",
    "rules",
    "Where the current rules are",
    "The ministry scholarship page is the public index for these five schemes, and it links guideline PDFs. Rules, dates, and institute lists change. JANMARG does not replace that page and does not show a live closing date. If a date matters, read it on the portal named for that scheme.",
    "वर्तमान नियम कहाँ हैं",
    "मंत्रालय का छात्रवृत्ति पृष्ठ इन पाँच योजनाओं की सार्वजनिक सूची है और दिशानिर्देश पीडीएफ से जुड़ा है। नियम, तिथियाँ और संस्थान सूची बदलती हैं। जनमार्ग उस पृष्ठ की जगह नहीं लेता और जीवित अंतिम तिथि नहीं दिखाता। तारीख मायने रखे तो उसी योजना के पोर्टल पर पढ़ें।",
    MOTA,
    MOTA_PAGE,
    "rules guideline current नियम pdf deadline date कहाँ kahan",
  ),
  ...pair(
    "docs",
    "all",
    "documents",
    "Documents — what this app will and will not do",
    "The ministry summary page does not print one combined document list for all five schemes. Each guideline and the portal you apply on name what they need. A checklist here only reminds you to look up category, income, education, academic record, and identity items. Do not upload those files here. Do not type an identity number, bank number, or OTP here. Enter them only on the official portal if that portal asks.",
    "दस्तावेज़ — यह ऐप क्या नहीं लेता",
    "मंत्रालय के सार पृष्ठ पर पाँचों योजनाओं की एक मिली हुई दस्तावेज़ सूची नहीं छपी है। हर दिशानिर्देश और आवेदन वाला पोर्टल अपनी जरूरत लिखता है। यहाँ की चेकलिस्ट केवल श्रेणी, आय, शिक्षा, शैक्षणिक रिकॉर्ड और पहचान मदें देखने की याद है। वे फ़ाइलें यहाँ न डालें। पहचान संख्या, बैंक संख्या या ओटीपी यहाँ न लिखें। केवल आधिकारिक पोर्टल पर भरें यदि वह माँगे।",
    MOTA,
    MOTA_PAGE,
    "document documents checklist कागज दस्तावेज identity upload मत क्या checklist",
  ),
  ...pair(
    "dbt",
    "all",
    "dbt",
    "What the page says about DBT",
    "The ministry page describes Direct Benefit Transfer as scheme benefits moving to bank accounts through the PFMS platform. It names DBT for Pre-Matric, Post-Matric, the fellowship, the Top Class scholarship, and the overseas scholarship. That description is general. JANMARG cannot see a student's sanction, bank credit, or payment status.",
    "डीबीटी के बारे में पृष्ठ क्या कहता है",
    "मंत्रालय पृष्ठ प्रत्यक्ष लाभ अंतरण को योजना लाभ का बैंक खातों तक पीएफएमएस के माध्यम से जाना बताता है। प्री-मैट्रिक, पोस्ट-मैट्रिक, फेलोशिप, टॉप क्लास और प्रवासी छात्रवृत्ति के लिए डीबीटी का नाम है। यह सामान्य वर्णन है। जनमार्ग किसी छात्र की मंजूरी, बैंक जमा या भुगतान स्थिति नहीं देख सकता।",
    MOTA,
    DBT_PAGE,
    "dbt direct benefit transfer pfms payment disbursement बैंक भुगतान मतलब what is",
  ),
  ...pair(
    "block",
    "all",
    "blocker",
    "What a reader can check before a portal visit",
    "JANMARG cannot see why an official file is held. Before you open a portal, the published pages point at four reading checks: the class matches the scheme, family income is within the ceiling printed for that scheme, the course or institute is the kind that scheme describes, and the form is filed on the portal that scheme names. A gap against those published lines is something to read on the official page. It is not a decision inside this app.",
    "पोर्टल खोलने से पहले क्या पढ़ें",
    "जनमार्ग नहीं देख सकता कि आधिकारिक फ़ाइल क्यों रुकी है। पोर्टल खोलने से पहले प्रकाशित पृष्ठ चार बातें पढ़ने को कहते हैं: कक्षा योजना से मेल खाती हो, परिवार की आय उस योजना की छपी सीमा के भीतर हो, पाठ्यक्रम या संस्थान वैसा हो जैसा योजना बताती है, और फॉर्म उसी पोर्टल पर हो जिसका नाम योजना लेती है। उन पंक्तियों से अंतर आधिकारिक पृष्ठ पर पढ़ने की बात है। इस ऐप का निर्णय नहीं।",
    MOTA,
    MOTA_PAGE,
    "blocked blocker why deficiency held pending missing आय course institute क्या रुका",
  ),
  ...pair(
    "digilocker",
    "nos",
    "documents",
    "DigiLocker is not connected here",
    "The ministry publishes its own DigiLocker instruction manual for the National Overseas Scholarship process. That manual belongs to the official process. JANMARG is not connected to DigiLocker and cannot fetch, store, or verify a document from it.",
    "डिजीलॉकर यहाँ जुड़ा नहीं है",
    "मंत्रालय राष्ट्रीय प्रवासी छात्रवृत्ति प्रक्रिया के लिए अपना डिजीलॉकर निर्देश पुस्तिका प्रकाशित करता है। वह पुस्तिका आधिकारिक प्रक्रिया की है। जनमार्ग डिजीलॉकर से जुड़ा नहीं है और वहाँ से दस्तावेज़ ला, रख या जाँच नहीं सकता।",
    "Ministry of Tribal Affairs — NOS DigiLocker manual",
    NOS_DIGILOCKER,
    "digilocker digi locker document fetch verify डिजीलॉकर",
  ),
  ...pair(
    "outreach",
    "all",
    "outreach",
    "Students who have not applied yet",
    "The public scheme pages do not list enrolled students who have not applied. JANMARG does not match school, APAAR, or identity databases. If you have not applied, read the scheme that matches your class and open the official portal yourself.",
    "जिन्होंने अभी आवेदन नहीं किया",
    "सार्वजनिक योजना पृष्ठ उन नामांकित छात्रों की सूची नहीं देते जिन्होंने आवेदन नहीं किया। जनमार्ग स्कूल, अपार या पहचान डेटाबेस से मिलान नहीं करता। यदि आपने आवेदन नहीं किया, अपनी कक्षा वाली योजना पढ़ें और आधिकारिक पोर्टल खुद खोलें।",
    MOTA,
    MOTA_PAGE,
    "not applied enrolled outreach apaar udise uncovered नहीं आवेदन",
  ),
  ...pair(
    "boundary",
    "all",
    "boundary",
    "What JANMARG will not decide",
    "JANMARG provides scholarship guidance and readiness support. It is not an official government portal. It is not connected to live scholarship, identity, or payment systems. Final eligibility, verification, sanction, application status, and payment decisions remain with the relevant official authority.",
    "जनमार्ग क्या तय नहीं करता",
    "जनमार्ग छात्रवृत्ति मार्गदर्शन और तैयारी सहायता देता है। यह आधिकारिक सरकारी पोर्टल नहीं है। यह जीवित छात्रवृत्ति, पहचान या भुगतान प्रणालियों से जुड़ा नहीं है। अंतिम पात्रता, जाँच, मंजूरी, आवेदन स्थिति और भुगतान का निर्णय संबंधित आधिकारिक प्राधिकारी के पास रहता है।",
    MOTA,
    MOTA_PAGE,
    "not official decision eligibility boundary मार्गदर्शन नहीं निर्णय",
  ),
];
