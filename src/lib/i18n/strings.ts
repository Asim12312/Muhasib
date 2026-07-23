export type Lang = "en" | "ur";

export const STRINGS = {
  // Public / navigation
  nav_penalty: { en: "Penalty calculator", ur: "جرمانہ کیلکولیٹر" },
  nav_irn: { en: "Invoice № checker", ur: "انوائس نمبر چیک کریں" },
  nav_signin: { en: "Sign in", ur: "لاگ اِن" },
  nav_start: { en: "Start free", ur: "مفت شروع کریں" },
  lang_toggle: { en: "اردو", ur: "English" },

  // Landing hero
  hero_kicker: { en: "FBR digital invoicing · Pakistan", ur: "ایف بی آر ڈیجیٹل انوائسنگ · پاکستان" },
  hero_title_1: { en: "Every invoice transmitted.", ur: "ہر انوائس ایف بی آر تک۔" },
  hero_title_2: { en: "Every penalty avoided.", ur: "ہر جرمانے سے حفاظت۔" },
  hero_body: {
    en: "Mohasib issues FBR-compliant digital invoices, transmits them to PRAL in real time, and returns the 22-digit invoice number and QR code — for your own business, or for every client on your books.",
    ur: "مُحاسِب ایف بی آر کے قواعد کے مطابق ڈیجیٹل انوائس بناتا ہے، انہیں فوری طور پر پی آر اے ایل کو بھیجتا ہے، اور 22 ہندسوں کا انوائس نمبر اور کیو آر کوڈ واپس دیتا ہے — آپ کے اپنے کاروبار کے لیے، یا آپ کے ہر کلائنٹ کے لیے۔",
  },
  hero_cta: { en: "Create your account", ur: "اکاؤنٹ بنائیں" },
  hero_cta_2: { en: "Check your penalty exposure", ur: "اپنا جرمانہ چیک کریں" },
  hero_free_note: { en: "Free for your first 5 invoices each month. No card required.", ur: "ہر مہینے پہلی 5 انوائسز مفت۔ کارڈ کی ضرورت نہیں۔" },

  // Mandate
  mandate_title: { en: "The mandate is already in force", ur: "قانون پہلے سے نافذ ہے" },
  mandate_body: {
    en: "Digital invoicing is mandatory for sales-tax registered persons under Chapter XIV of the Sales Tax Rules 2006. Non-compliance risks fines under Section 33 of the Sales Tax Act 1990.",
    ur: "سیلز ٹیکس کے لیے رجسٹرڈ افراد پر ڈیجیٹل انوائسنگ لازمی ہے (سیلز ٹیکس رولز 2006، باب چودہ کے تحت)۔ خلاف ورزی پر سیلز ٹیکس ایکٹ 1990 کی دفعہ 33 کے تحت جرمانہ عائد ہو سکتا ہے۔",
  },

  // Features
  feature_1_h: { en: "Real-time PRAL transmission", ur: "پی آر اے ایل سے براہ راست رابطہ" },
  feature_1_p: {
    en: "Create an invoice, press transmit, get the 22-digit FBR number and QR payload back. Sandbox mode included so you can test before going live.",
    ur: "انوائس بنائیں، بھیجیں، اور 22 ہندسوں کا ایف بی آر نمبر اور کیو آر کوڈ فوراً حاصل کریں۔ لائیو جانے سے پہلے آزمانے کے لیے سینڈ باکس بھی موجود ہے۔",
  },
  feature_2_h: { en: "Built for tax consultants", ur: "ٹیکس کنسلٹنٹس کے لیے بنایا گیا" },
  feature_2_p: {
    en: "Keep every client — registered or unregistered buyers, any province — in one portal. See at a glance which clients have drafts or rejections outstanding.",
    ur: "ہر کلائنٹ ایک ہی جگہ سنبھالیں — رجسٹرڈ ہو یا غیر رجسٹرڈ خریدار، کوئی بھی صوبہ۔ ایک نظر میں دیکھیں کس کلائنٹ کے ڈرافٹ یا مسترد انوائس باقی ہیں۔",
  },
  feature_3_h: { en: "Bulk import from Excel/CSV", ur: "ایکسل/سی ایس وی سے بلک اپلوڈ" },
  feature_3_p: {
    en: "Drop in the sales register your client already keeps. Rows with the same invoice number are grouped automatically and validated before transmission.",
    ur: "کلائنٹ کا موجودہ سیلز رجسٹر اپلوڈ کریں۔ ایک ہی انوائس نمبر والی رَوز خودکار طور پر ایک انوائس میں جمع ہو جاتی ہیں اور بھیجنے سے پہلے چیک ہو جاتی ہیں۔",
  },

  // Free tools card
  tools_title: { en: "Free tools, no signup", ur: "مفت ٹولز، اکاؤنٹ کے بغیر" },
  tools_body: {
    en: "Estimate what late or missing digital invoices could cost under Section 33, and verify whether an invoice number matches the FBR 22-digit format.",
    ur: "معلوم کریں کہ گمشدہ یا دیر سے بھیجی گئی انوائس دفعہ 33 کے تحت کتنی مہنگی پڑ سکتی ہے، اور انوائس نمبر 22 ہندسوں کے ایف بی آر فارمیٹ میں ہے یا نہیں۔",
  },

  // Pricing
  pricing_title: { en: "Pricing", ur: "قیمتیں" },
  price_free: { en: "Free", ur: "مفت" },
  price_free_per: { en: "forever", ur: "ہمیشہ کے لیے" },
  price_biz: { en: "Business", ur: "بزنس" },
  price_biz_per: { en: "per month", ur: "فی مہینہ" },
  price_firm: { en: "Firm", ur: "کنسلٹنسی" },
  price_firm_per: { en: "per client / month", ur: "فی کلائنٹ / مہینہ" },

  // Footer
  footer_line_1: { en: "Mohasib · FBR digital invoicing · Lahore, Pakistan", ur: "مُحاسِب · ایف بی آر ڈیجیٹل انوائسنگ · لاہور، پاکستان" },
  footer_line_2: {
    en: "Penalty figures are estimates based on Section 33, Sales Tax Act 1990 as cited by licensed integrators — verify against the current text of the law.",
    ur: "جرمانے کے تخمینے سیلز ٹیکس ایکٹ 1990 کی دفعہ 33 سے لیے گئے ہیں جیسا کہ لائسنس یافتہ انٹیگریٹرز حوالہ دیتے ہیں — قانون کے موجودہ متن سے تصدیق کر لیں۔",
  },

  // Penalty tool
  pen_title: { en: "FBR digital invoicing penalty calculator", ur: "ایف بی آر ڈیجیٹل انوائس جرمانہ کیلکولیٹر" },
  pen_intro: {
    en: "Estimate the exposure for failing to issue — or transmitting late — a digital invoice under Section 33 of the Sales Tax Act 1990, read with Chapter XIV of the Sales Tax Rules 2006 (SRO 69(I)/2025, SRO 1413(I)/2025, SRO 1852(I)/2025).",
    ur: "جانیں کہ ڈیجیٹل انوائس جاری نہ کرنے یا دیر سے بھیجنے پر سیلز ٹیکس ایکٹ 1990 کی دفعہ 33 اور سیلز ٹیکس رولز 2006 کے باب چودہ (SRO 69(I)/2025، SRO 1413(I)/2025، SRO 1852(I)/2025) کے تحت کتنا جرمانہ ہو سکتا ہے۔",
  },
  pen_tax_label: { en: "Sales tax involved (PKR)", ur: "متعلقہ سیلز ٹیکس (روپے)" },
  pen_tax_hint: { en: "Total sales tax on the invoice(s) not issued digitally.", ur: "ان انوائسز پر کُل سیلز ٹیکس جو ڈیجیٹل جاری نہیں کیں۔" },
  pen_days_label: { en: "Days late / rejected", ur: "دیر یا مسترد ہونے کے دن" },
  pen_days_hint: { en: "Days an invoice stayed untransmitted or rejected after issuance.", ur: "جاری کرنے کے بعد انوائس کتنے دن غیر منتقل یا مسترد رہی۔" },
  pen_flat: { en: "Flat fine (failure to issue digital invoice)", ur: "مقررہ جرمانہ (ڈیجیٹل انوائس جاری نہ کرنا)" },
  pen_pct: { en: "2% of tax involved", ur: "متعلقہ ٹیکس کا 2 فیصد" },
  pen_issue: { en: "Issue penalty — whichever is higher", ur: "جو زیادہ ہو، وہی جرمانہ" },
  pen_late: { en: "Late/rejected transmission", ur: "دیر یا مسترد ہونے پر جرمانہ" },
  pen_exposure: { en: "Estimated exposure", ur: "متوقع جرمانہ" },
  pen_disclaimer_h: { en: "How this is calculated.", ur: "حساب کیسے لگایا گیا:" },
  pen_disclaimer: {
    en: "Licensed integrators cite a fine of PKR 50,000 or 2% of the tax involved (whichever is greater) for failure to issue a digital invoice, and PKR 25,000 per day for late or rejected transmission. Published sources disagree on the exact statutory wording, so treat this as an estimate. This is not legal advice; confirm with your tax advisor or the current text of the Sales Tax Act.",
    ur: "لائسنس یافتہ انٹیگریٹرز کے مطابق ڈیجیٹل انوائس جاری نہ کرنے پر 50,000 روپے یا متعلقہ ٹیکس کا 2 فیصد (جو زیادہ ہو) جرمانہ ہے، اور دیر سے یا مسترد ٹرانسمیشن پر 25,000 روپے فی دن۔ قانونی متن پر مختلف ذرائع میں فرق ہے، اس لیے یہ صرف تخمینہ ہے۔ یہ قانونی مشورہ نہیں — اپنے ٹیکس مشیر یا سیلز ٹیکس ایکٹ کے موجودہ متن سے تصدیق کریں۔",
  },

  // IRN tool
  irn_title: { en: "FBR invoice number checker", ur: "ایف بی آر انوائس نمبر چیک کریں" },
  irn_intro: {
    en: "Every invoice successfully transmitted under the digital invoicing regime is assigned a unique 22-digit FBR invoice number, printed on the invoice with a QR code. Paste a number to check it matches the format.",
    ur: "کامیابی سے بھیجی گئی ہر ڈیجیٹل انوائس کو ایف بی آر ایک منفرد 22 ہندسوں کا نمبر دیتا ہے، جو کیو آر کوڈ کے ساتھ انوائس پر چھپتا ہے۔ نمبر پیسٹ کریں اور فارمیٹ چیک کریں۔",
  },
  irn_label: { en: "Invoice number", ur: "انوائس نمبر" },
  irn_ok: { en: "Format valid", ur: "فارمیٹ درست" },
  irn_ok_hint: { en: "22 digits — matches the FBR digital invoice number format.", ur: "22 ہندسے — ایف بی آر ڈیجیٹل انوائس نمبر کے مطابق۔" },
  irn_bad: { en: "Format issue", ur: "فارمیٹ میں مسئلہ" },
  irn_note: {
    en: "A valid format does not by itself prove the invoice exists on FBR record — it only confirms the number is well-formed. To verify authenticity, scan the invoice QR code with the FBR Tax Asaan app.",
    ur: "درست فارمیٹ کا مطلب صرف یہ ہے کہ نمبر ٹھیک بنا ہوا ہے، اصل تصدیق کے لیے ایف بی آر ٹیکس آسان ایپ سے کیو آر کوڈ اسکین کریں۔",
  },

  // Auth
  auth_signin: { en: "Sign in", ur: "لاگ اِن" },
  auth_email: { en: "Email", ur: "ای میل" },
  auth_password: { en: "Password", ur: "پاس ورڈ" },
  auth_signup_hint: { en: "New here?", ur: "پہلی بار آئے ہیں؟" },
  auth_signup_link: { en: "Create an account", ur: "اکاؤنٹ بنائیں" },
  auth_signup: { en: "Create your account", ur: "اپنا اکاؤنٹ بنائیں" },
  auth_signup_sub: { en: "Free for 5 invoices a month. No card required.", ur: "ہر مہینے 5 انوائسز مفت۔ کارڈ کی ضرورت نہیں۔" },
  auth_name: { en: "Your name", ur: "آپ کا نام" },
  auth_password_new: { en: "Password (8+ characters)", ur: "پاس ورڈ (کم از کم 8 حروف)" },
  auth_have_account: { en: "Already registered?", ur: "پہلے سے اکاؤنٹ ہے؟" },
  auth_create_btn: { en: "Create account", ur: "اکاؤنٹ بنائیں" },
  auth_signing_in: { en: "Signing in…", ur: "لاگ اِن ہو رہا ہے…" },
  auth_creating: { en: "Creating…", ur: "بن رہا ہے…" },
} as const;

export type StringKey = keyof typeof STRINGS;

export function t(key: StringKey, lang: Lang): string {
  return STRINGS[key][lang];
}
