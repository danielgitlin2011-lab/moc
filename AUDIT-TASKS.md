# חלוקת ביקורת האתר לחמש משימות ביצוע

כל משימה למטה היא פרומפט עצמאי ומוכן להדבקה בסשן חדש של Claude Code. יחד הן מכסות את כל 100 הסעיפים מ-`SITE-AUDIT.md` (נמצא בענף `claude/site-audit-improvements-y5j33e`).

| # | משימה | סעיפים | היקף |
|---|-------|--------|------|
| 1 | הקשחת אבטחה | 1–25 | 25 |
| 2 | ביצועים וטעינת פונטים | 26–40 | 15 |
| 3 | נגישות ואמינות נתונים | 41–52, 89–95 | 19 |
| 4 | עיצוב ו-UX | 53–80 | 28 |
| 5 | SEO, איכות קוד ותשתית | 81–88, 96–100 | 13 |

---

## משימה 1 — הקשחת אבטחה (סעיפים 1–25)

```
אתה עובד על ריפו danielgitlin2011-lab/moc — אפליקציית Next.js 16 (App Router) + Supabase
בשם ServeSite: SaaS לבניית אתרים לקייטרינג. בענף claude/site-audit-improvements-y5j33e
נמצא מסמך ביקורת בשם SITE-AUDIT.md; קרא ממנו את סעיפים 1–25 (פרק "אבטחה") — הם
המפרט המחייב של המשימה. עבוד על הענף שהוקצה לסשן שלך.

המטרה: לסגור את כל 25 ממצאי האבטחה. סדר עדיפויות מחייב:

שלב א — חסימת XSS (קריטי):
- סעיף 2: ב-app/site/[businessSlug]/page.tsx:54 ה-JSON-LD מוזרק עם
  dangerouslySetInnerHTML ללא escaping. צור helper (למשל lib/json-ld.ts) שמחליף
  < ב-< (וגם > ו-&) אחרי JSON.stringify, והשתמש בו. הוסף בדיקת יחידה
  שמוכיחה ש-</script> בתוכן עסק לא שובר את התג.
- סעיפים 3–5: צור פונקציית safeHttpUrl ב-lib/utils.ts שמאשרת רק http/https
  ומחזירה "" אחרת. החל אותה על קישורי social (components/public-website.tsx:472),
  mapUrl (שם, שורה 404), ועל כל URL של תמונה/לוגו לפני רינדור ולפני שמירה
  בדפי ההגדרות והעיצוב.
- סעיף 1: הוסף כותרת Content-Security-Policy ב-next.config.ts. התחל ממדיניות
  שמכסה את המציאות הקיימת (script-src 'self' + מה ש-Next דורש, img-src עם
  https: כי תמונות לקוח מגיעות מדומיינים שונים, frame-ancestors 'self').
  ודא ש-npm run build ושהאתר עולים בלי שגיאות CSP בקונסול.

שלב ב — קשיחות צד-שרת מול ה-anon key:
- סעיפים 6–8: הוסף הגנת קצב ל-record_site_visit בתוך הפונקציה עצמה בדאטהבייס
  (מיגרציה חדשה תחת supabase/migrations/ — למשל טבלת דגימה או מגבלת אירועים
  ליום לעסק), כי אפשר לקרוא לה ישירות ב-RPC ולעקוף את /api/track. עבור לידים:
  העבר את ההכנסה מ-insert ישיר בדפדפן (components/quote-request-form.tsx:88)
  ל-API route חדש (app/api/leads/route.ts) עם ולידציית zod צד-שרת, בדיקת
  honeypot, ו-rate limit בסיסי לפי IP; חסום בהמשך insert ישיר של anon ב-RLS
  רק אם אתה יכול לוודא שה-route החדש עובד end-to-end.
- סעיפים 9–10, 21: מיגרציה עם CHECK constraints לאורכי שדות leads (למשל עד
  200–2000 תווים לפי שדה), ולידציית פורמט בסיסית לאימייל, ואילוץ על
  businesses.slug: לא ריק, תואם ^[a-z0-9-]{2,60}$, ולא ברשימת ערכים שמורים
  (api, www, site, dashboard, login, signup).
- סעיף 16: הוסף משתנה סביבה NEXT_PUBLIC_SITE_ORIGIN; ב-lib/seo.ts העדף אותו
  על כותרת Host ופול-בק להתנהגות הקיימת רק בפיתוח.

שלב ג — אימות וחשבון:
- סעיף 11: העלה מינימום סיסמה ל-8 תווים ב-app/signup/page.tsx ותעד ב-README
  שיש להפעיל בדיקת סיסמאות שדלפו בהגדרות Supabase Auth.
- סעיף 13: ממש שכחתי-סיסמה מלא: resetPasswordForEmail בדף הלוגין + דף
  /reset-password לקביעת סיסמה חדשה. הסר את window.alert.
- סעיף 14: הסר את checkbox ה-"Remember me" המזויף.
- סעיף 15: מפה שגיאות Supabase Auth להודעות ידידותיות (Invalid login credentials
  → הודעה כללית) במקום להציג error.message גולמי.
- סעיף 12: הוסף ל-README סעיף "המלצות אבטחה" שמתעד ש-MFA (TOTP) זמין ב-Supabase
  ומה נדרש כדי להפעילו בהמשך (אין צורך לממש UI מלא במשימה זו).

שלב ד — כותרות, העלאות וקוד מת:
- סעיפים 17–18: ב-app/api/uploads/route.ts הוסף מגבלת העלאות פשוטה למשתמש
  (למשל ספירת קבצים תחת prefix של המשתמש ב-Blob עם list, עם תקרה סבירה),
  ומחיקת ה-blob הישן כשמעלים תמונה חלופית (העבר את ה-URL הישן בבקשה ומחק
  עם del רק אם הוא שייך ל-prefix של אותו משתמש).
- סעיפים 19–20: ב-next.config.ts הוסף preload ל-HSTS,
  Cross-Origin-Opener-Policy: same-origin ו-Cross-Origin-Resource-Policy: same-site.
- סעיף 22: מחק את app/chatgpt-auth.ts ואת .openai/hosting.json.
- סעיפים 23–25: צור דפי /privacy ו-/terms עם תוכן בסיסי אמיתי וקשר אליהם
  מהלוגין, ההרשמה וטופס הלידים; הוסף תיעוד ב-README על מחיקת חשבון ונתונים
  (מה נמחק ואיך) ועל היעדר ניטור התחברויות ככiron החוב שנותר.

דרישות איכות: אחרי כל שלב הרץ npm run lint && npm run typecheck && npm run test:unit,
ובסוף npm test מלא. אל תשבור התנהגות קיימת של RLS. כתוב קומיטים נפרדים לכל שלב
עם הודעות ברורות, ודחוף לענף שהוקצה לך.
```

---

## משימה 2 — ביצועים וטעינת פונטים (סעיפים 26–40)

```
אתה עובד על ריפו danielgitlin2011-lab/moc — אפליקציית Next.js 16 (App Router) + Supabase
בשם ServeSite: SaaS לאתרי קייטרינג. בענף claude/site-audit-improvements-y5j33e נמצא
SITE-AUDIT.md; קרא ממנו את סעיפים 26–40 (פרק "ביצועים") — זה המפרט המחייב.
עבוד על הענף שהוקצה לסשן שלך.

המטרה: לתקן את 15 ממצאי הביצועים. סדר עבודה:

1. הבאג הקריטי — הפונטים לא נטענים (סעיף 28): המוצר מוכר בחירת טיפוגרפיה
   (Cormorant Garamond, Playfair Display, Fraunces, Libre Baskerville, DM Sans,
   Source Sans 3, Lato, Jost, Work Sans, Inter — ראה app/dashboard/design/page.tsx:16
   ו-lib/utils.ts fontStack), אבל אף פונט לא נטען בפועל — אין @font-face ואין import.
   פתרון נדרש: טעינה דינמית של הפונטים הנבחרים בלבד באתר הלקוח (למשל link
   ל-fonts.googleapis.com עם display=swap שנבנה משמות הפונט של ה-theme, כולל
   preconnect), גם ב-/site/[businessSlug], גם ב-/preview וגם בדף העיצוב. ודא
   שהשמות שנשמרים תואמים בדיוק לשמות ב-Google Fonts.

2. שכבת השמירה (סעיפים 26–27): צור hook משותף (למשל lib/use-debounced-save.ts)
   עם debounce של ~600ms, ביטול בקשה קודמת, ומניעת out-of-order writes
   (מונה גרסה — התעלם מתשובה ישנה). החלף בו את השמירה-על-כל-הקשה בדפים:
   dashboard/settings, dashboard/website, preview, ובכל עורך שמתנהג כך.

3. רינדור ותמונות (סעיפים 29–32, 35):
   - פצל את components/public-website.tsx: החלק הסטטי ירונדר בשרת, והאינטראקטיביות
     (מובייל-נאב, טאבים, לייטבוקס, טופס) תישאר באיים client. שמור על תאימות מלאה
     ל-preview ולמצב editable.
   - הוסף prop sizes ל-SiteImage והגדר ערכים נכונים בכל שימוש (hero: 100vw,
     כרטיסים: לפי הגריד).
   - הרחב את sizedImage (lib/utils.ts) לתמוך גם ב-host של Vercel Blob אם הוא תומך
     בפרמטרי resize; אם לא — תעד ותשאיר.
   - הוסף preconnect לדומיין ה-Blob ב-app/layout.tsx לצד unsplash.
   - החלף decoding="sync" ב-async ב-components/site-image.tsx וב-app/page.tsx.

4. קאשינג (סעיפים 33–34): צור RPC אחת (מיגרציה תחת supabase/migrations/) או
   שאילתה מאוחדת שמחזירה את כל ה-bundle הציבורי במקום 11 שאילתות
   ב-lib/supabase/get-public-business.ts, והוסף revalidate (ISR) סביר לדף
   /site/[businessSlug] — שים לב שהדף משתמש ב-headers() דרך requestOrigin,
   תצטרך לפתור זאת (origin קבוע מ-env) כדי לאפשר קאשינג.

5. שאר הסעיפים: fallback מבוסס IntersectionObserver ל-reveal-on-scroll (36);
   dynamic import ללייטבוקס ולטופס ההצעה (37); דיווח Web Vitals בסיסי (38);
   הגבלת sitemap עם עימוד/sitemap index (39); דחיסת/מיטוב נכסים סטטיים (40).

דרישות איכות: npm run lint && npm run typecheck && npm run test:unit אחרי כל שלב,
npm test מלא בסוף. אל תשנה התנהגות מוצרית. ודא שהדף הציבורי עדיין עובר את בדיקות
tests/rendered-html.test.mjs ו-tests/structured-data.test.mjs. קומיטים נפרדים לכל
שלב, דחוף לענף שהוקצה לך.
```

---

## משימה 3 — נגישות ואמינות נתונים (סעיפים 41–52, 89–95)

```
אתה עובד על ריפו danielgitlin2011-lab/moc — אפליקציית Next.js 16 (App Router) + Supabase
בשם ServeSite: SaaS לאתרי קייטרינג. בענף claude/site-audit-improvements-y5j33e נמצא
SITE-AUDIT.md; קרא ממנו את סעיפים 41–52 (פרק "נגישות") ו-89–95 (פרק "אמינות
ונתונים") — זה המפרט המחייב. עבוד על הענף שהוקצה לסשן שלך.

חלק א — נגישות (41–52):
- ConfirmDialog (components/ui.tsx:48): חבר ל-useModalBehavior הקיים
  (components/use-modal-behavior.ts) — מלכודת פוקוס, Escape, החזרת פוקוס,
  ופוקוס התחלתי על כפתור הביטול.
- skip-link באתר הציבורי (components/public-website.tsx:444): הפנה ל-main content
  (עטוף את הסקשנים ב-<main id="main">) והוסף קישור שני לטופס ההצעה.
- שפה וכיוון פר-אתר (43): הוסף שדה language ל-theme/business (מיגרציה + mappers +
  UI בהגדרות), וקבע lang ו-dir על עטיפת האתר הציבורי בהתאם (he→rtl).
- role="alert" לשגיאות ב-app/login/page.tsx:52, app/signup/page.tsx:63,
  app/onboarding/page.tsx:152.
- Field (components/ui.tsx:44): קשר hint לשדה עם aria-describedby (צור id ייחודי).
- אזהרת ניגודיות (46): בדף dashboard/design חשב יחס ניגודיות WCAG בין צבעי
  הלקוח לרקע והצג אזהרה לא-חוסמת מתחת לבוחרי הצבע כשהיחס < 4.5:1.
- מלכודת פוקוס למגירת המובייל של האתר הציבורי (47).
- גלריה (48): הסר את הכפילות aria-label/alt ותקן label ריק כשאין caption.
- מונה לייטבוקס עם aria-live="polite" (49).
- טוסט (app-provider.tsx): בטל טיימר קודם לפני חדש, הארך ל-5 שניות, והוסף
  וריאנט שגיאה (ראה גם סעיף 54 במסמך — מותר לפתור אותו כאן).
- mini-chart (dashboard/page.tsx:146): הוסף טבלת נתונים חלופית (sr-only) במקום
  aria-label ארוך.
- ניווט ההגדרות (dashboard/settings): aria-current="true" לטאב הפעיל.

חלק ב — אמינות ונתונים (89–95):
- אזורי זמן (89): החלט על מקור אמת אחד ליום אנליטיקס. הפתרון המומלץ: השאר את
  הרישום ב-UTC בדאטהבייס (supabase/migrations/...:44) ותקן את הדשבורד לקבץ
  לפי UTC (lib/analytics.ts dayKey) כך שהרישום והקיבוץ עקביים; עדכן את בדיקות
  tests/analytics.test.mjs בהתאם.
- visit-tracker (90): סמן sessionStorage רק אחרי תשובת 2xx, הסר את ה-abort
  ב-cleanup (ההגנה מכפילות היא הדגל עצמו), וודא התנהגות נכונה תחת StrictMode.
- בוטים (91): הוסף ל-/api/track דרישה מינימלית שהבקשה תגיע מהדף (בדיקת
  sec-fetch-site: same-origin) בנוסף לסינון ה-UA.
- image-uploader (92): עטוף את response.json() ב-try/catch ותן הודעת שגיאה
  ידידותית כשמתקבלת תשובה לא-JSON.
- retry (93): בשמירות הדשבורד הוסף ניסיון חוזר אוטומטי אחד על כשל רשת לפני
  הצגת שגיאה.
- locale (94): רכז את קבוע ה-locale במקום אחד (lib/utils.ts) כך שיהיה ניתן
  להחלפה, והשתמש בו בכל ה-formatters.
- סנטינלים (95): הפסק לשמור "Not specified"/"None shared"/"Open to recommendations"
  — שמור מחרוזת ריקה/NULL בטופס (components/quote-request-form.tsx:94-104)
  והצג את הטקסטים האלה בשכבת התצוגה בלבד (lead-details-drawer). אל תיגע
  בנתונים קיימים.

דרישות איכות: npm run lint && npm run typecheck && npm run test:unit אחרי כל
קבוצת שינויים, npm test מלא בסוף. קומיטים נפרדים לחלק א ולחלק ב לפחות, דחוף
לענף שהוקצה לך.
```

---

## משימה 4 — עיצוב ו-UX (סעיפים 53–80)

```
אתה עובד על ריפו danielgitlin2011-lab/moc — אפליקציית Next.js 16 (App Router) + Supabase
בשם ServeSite: SaaS לאתרי קייטרינג. בענף claude/site-audit-improvements-y5j33e נמצא
SITE-AUDIT.md; קרא ממנו את סעיפים 53–80 (פרק "עיצוב ו-UX") — זה המפרט המחייב.
עבוד על הענף שהוקצה לסשן שלך.

עבוד בארבע קבוצות, עם קומיט לכל קבוצה:

קבוצה 1 — יושרת מודל השמירה (53–58):
- הסר את כפתור "Save changes" המזויף מ-dashboard/settings (השמירה אוטומטית),
  והחלף אותו בחיווי סטטוס "שומר…/נשמר/שגיאה" אמיתי שמשקף את הבקשות בפועל.
- הוסף וריאנט שגיאה לטוסט (app-provider.tsx) — אייקון ⚠ וצבע שונה — וגרום לכל
  קריאות notify של כשלי שמירה להשתמש בו (אם משימה 3 כבר עשתה זאת — דלג).
- הוסף rollback לעדכונים אופטימיים: כשה-persist נכשל, החזר את ה-state הקודם
  (בנה helper אחד ועבור איתו על settings, menu, preview, lead-details-drawer).
- החלף את window.alert של "Forgot password" בקישור/טקסט מהוגן (אם משימה 1
  מימשה איפוס סיסמה — קשר אליו).
- הוסף דיאלוג אישור לפני unpublish של אתר חי (settings/page.tsx:171) —
  השתמש ב-ConfirmDialog הקיים.

קבוצה 2 — אונבורדינג (59–63):
- הוסף בשלב 5 בחירה מפורשת "פרסם עכשיו / שמור כטיוטה" במקום פרסום אוטומטי.
- הפוך את יצירת העסק לאטומית: העבר את הרצף עסק→sections→קטגוריה→מנות ל-RPC
  אחת בדאטהבייס (מיגרציה תחת supabase/migrations/) כך שכשל באמצע לא משאיר
  עסק יתום ולחיצה חוזרת לא יוצרת כפילות.
- שמור טיוטת אונבורדינג ב-sessionStorage ושחזר אותה אחרי refresh.
- אחד את שמות הפונטים בין onboarding/page.tsx:174 לבין
  dashboard/design/page.tsx:16 — השתמש בשמות המלאים ("Cormorant Garamond",
  "Playfair Display", "Source Sans 3") בשני המקומות.
- נקה את ברירות המחדל של פריט תפריט חדש (dashboard/menu/page.tsx:16): בלי
  תמונת unsplash זרה, בלי "Kosher"/"72 hours"/"10 guests" אוטומטיים — שדות
  ריקים עם placeholders.

קבוצה 3 — אתר הלקוח (64–66, 76–78):
- הפוך את הטקסטים הקשיחים לניתנים לעריכה או הסר אותם: "Discover our table",
  שורת ה-menu-promise, שורת הגלריה, ו"Response time: Within one business day"
  (public-website.tsx + quote-request-form.tsx) — הוסף שדות theme/section
  במיגרציה + mappers + UI עריכה, עם ברירות המחדל הנוכחיות.
- תקן את הלייטבוקס כך שידפדף בכל תמונות הקולקציה ולא רק עד galleryLimit.
- שפר את דף "האתר לא זמין" (site/[businessSlug]/not-found.tsx) עם הסבר קצר.
- favicon דינמי לאתר לקוח מהלוגו שלו (icons ב-generateMetadata) כשקיים לוגו.
- i18n (77): אל תבנה מערכת i18n מלאה במשימה זו — הכן תשתית מינימלית בלבד
  (ריכוז מחרוזות האתר הציבורי בקובץ אחד) ותעד ב-README את הצעד הבא.

קבוצה 4 — דשבורד ושיווק (67–75, 79–80):
- סידור בגרירה (drag & drop) לגלריה ולתפריט — HTML5 DnD בלי ספרייה חדשה,
  עם עדכון position ב-Supabase בסיום גרירה, ותמיכת מקלדת קיימת נשמרת.
- סינון לידים לפי טווח תאריכים + ייצוא CSV (כפתור בדף dashboard/leads שמייצר
  קובץ בצד לקוח).
- עטוף את ה-preview ב-iframe אמיתי (או תעד למה לא, אם זה שובר את מצב העריכה —
  במקרה כזה בודד את ה-CSS עם prefix).
- הצג את הכתובת האמיתית /site/slug בכל מקום שמוצג "slug.servesite.co", עם
  תווית "כתובת זמנית" (dashboard/page.tsx:27, settings:175, onboarding:187).
- דף השיווק (app/page.tsx): תקן את קישור הדמו כך שיפנה לעסק שקיים באמת או
  יוסתר כשאין; שנת זכויות דינמית; הפוך את "Explore feature" ללא-קישור ויזואלית
  או קשר לעוגן רלוונטי.
- תיוג עקבי "Coming soon" לכל הפיצ'רים המדומים (Create quote, חיבור דומיין,
  החלפת תוכנית, WhatsApp notifications) — רכיב Badge אחיד.
- הוסף מצב כהה לדשבורד רק אם נשאר זמן — עדיפות אחרונה (71); אחרת תעד כחוב.
- סעיף 79 (אימייל על ליד חדש): אל תממש שליחת מייל — הוסף תווית "בקרוב" להגדרה
  ותעד ב-README מה נדרש (Edge Function + Resend/SES).

דרישות איכות: npm run lint && npm run typecheck && npm run test:unit אחרי כל
קבוצה, npm test מלא בסוף. אל תשבור את בדיקות ה-HTML הקיימות. דחוף לענף שהוקצה לך.
```

---

## משימה 5 — SEO, איכות קוד ותשתית (סעיפים 81–88, 96–100)

```
אתה עובד על ריפו danielgitlin2011-lab/moc — אפליקציית Next.js 16 (App Router) + Supabase
בשם ServeSite: SaaS לאתרי קייטרינג. בענף claude/site-audit-improvements-y5j33e נמצא
SITE-AUDIT.md; קרא ממנו את סעיפים 81–88 (פרק "SEO") ו-96–100 (פרק "איכות קוד
ותשתית") — זה המפרט המחייב. עבוד על הענף שהוקצה לסשן שלך.

חלק א — SEO (81–88):
- fallback ל-meta description באתרי לקוחות (app/site/[businessSlug]/page.tsx:15):
  כשאין tagline/description, בנה תיאור מהנתונים הקיימים ("קייטרינג {type} ב-{city}").
- הוסף og:locale ו-width/height לתמונת ה-OG של אתר לקוח (אין מידות אמיתיות —
  השתמש ב-1200x630 המקובל רק אם אתה מוסיף גם חיתוך בפועל; אחרת הוסף רק locale
  ותעד).
- הסר את aggregateRating מ-lib/structured-data.ts:48-57 (המלצות שהבעלים מזין
  בעצמו מפרות את הנחיות Google) ועדכן את tests/structured-data.test.mjs בהתאם.
  השאר את התצוגה הוויזואלית של הדירוג באתר.
- שפר את lastModified בסייטמאפ: מיגרציה שמוסיפה טריגר לעדכון
  businesses.updated_at כשילדים משתנים, או חלופה פשוטה יותר — תעד את הבחירה.
- הבטח H1 יחיד באתר לקוח: כשסקשן ה-hero מוסתר, הפוך את הכותרת של הסקשן הראשון
  הגלוי ל-h1 (components/public-website.tsx).
- structured data לדף השיווק (app/page.tsx): Organization + WebSite + FAQPage
  מה-FAQ הקיים בדף, עם אותו מנגנון הזרקה בטוח שקיים (אם משימה 1 יצרה helper
  escaping — השתמש בו).
- אכיפת דומיין קנוני: הוסף redirect ב-next.config.ts (www→apex) מבוסס משתנה
  סביבה, ותעד.
- דפי גילוי (86): אל תממש — תעד ב-README כהצעת המשך עם קווי מתאר.

חלק ב — איכות קוד ותשתית (96–100):
- CI (96): צור .github/workflows/ci.yml שמריץ על כל push ו-PR:
  npm ci, npm run lint, npm run typecheck, npm run test:unit. הוסף job נפרד
  ל-npm test המלא (build) על PR בלבד. שים לב שהבדיקות המלאות דורשות משתני
  סביבה של Supabase — השתמש בערכי דמה אם הבנייה מאפשרת, אחרת הגבל ל-test:unit
  ותעד.
- בדיקות (97): הוסף בדיקות יחידה ל-lib/supabase/mappers.ts (round-trip של
  business/theme/menu item), לוולידציית ה-schema של טופס ההצעה, ובדיקות
  לפונקציות העזר החדשות שנוספו במשימות האחרות אם קיימות (json-ld escaping,
  safeHttpUrl).
- קוד מת (98): מחק את app/chatgpt-auth.ts ואת .openai/hosting.json אם עדיין
  קיימים (ייתכן שמשימה 1 כבר מחקה).
- error tracking (99): הוסף hook דיווח מרכזי — פונקציה reportError אחת
  שכרגע כותבת console.error מובנה, מחוברת ל-global-error.tsx ול-error.tsx,
  עם תיעוד איך לחבר Sentry בהמשך (בלי להוסיף תלות חדשה).
- סכימת DB (100): הפק את הסכימה המלאה הנוכחית מהדאטהבייס (יש MCP של Supabase
  זמין — list_tables) וכתוב אותה כקובץ supabase/schema.sql מתועד בריפו, כולל
  כל ה-RLS policies, כך שאפשר לשחזר סביבה מאפס. אל תריץ אותה על הפרויקט החי.

דרישות איכות: npm run lint && npm run typecheck && npm run test:unit ירוקים,
npm test מלא בסוף. קומיטים נפרדים ל-SEO ולתשתית, דחוף לענף שהוקצה לך.
```
