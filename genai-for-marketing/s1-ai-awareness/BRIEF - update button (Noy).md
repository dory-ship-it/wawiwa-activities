# בריף לנוי: האינטראקטיב החדש ב-GenAI for Marketing, מפגש 1, וכפתור העדכון

6 באוקטובר 2026 · מאת דור

## מה השתנה
בלוק ה-Storyline הראשון בשיעור 1 בקורס "Generative AI for Marketing Professionals" ב-Rise ("AI Awareness", 33 מסכים) הוחלף בגרסה שנבנתה בקוד. היא נראית אותו דבר: אותן תמונות, אותם סרטונים ואותם קישורים. עכשיו אפשר לעדכן אותה בלי קובץ Storyline.

- **קישור חי:** https://dory-ship-it.github.io/wawiwa-activities/genai-for-marketing/s1-ai-awareness/
- **בכל מסך עם קריין** יש אייקון רמקול לעצירה ולהמשך. הכתוביות כבויות כברירת מחדל, ומדליקים אותן בכפתור CC.

## איך מעדכנים (המומחה עובד רק במצגת שלו)
1. המומחה (עודד) משנה טקסט או תמונה במצגת Google Slides שלו: "Wawiwa AI for Marketing Training Session 1".
2. במצגת עצמה בוחרים בתפריט **Wawiwa ← Send to interactive**.
3. נפתח Pull Request ב-GitHub, כלומר בקשה לעדכן את הקבצים, עם רשימת שינויים בשפה פשוטה: מסך, מה היה ומה יהיה. נכנסים רק שקפים שהשתנו מאז העדכון הקודם.
4. דור קורא את הרשימה ולוחץ **Merge**. אחרי כדקה הגרסה החדשה באוויר, באותו קישור ב-Rise. ב-Rise עצמו לא נוגעים.

## מה לבדוק ברשימת השינויים לפני Merge
- **"check: replaces self-study wording"** (מסכים 12 ו-33): בשני המסכים האלה הנוסח נכתב במיוחד ללמידה עצמית. בודקים שהשינוי מהמצגת באמת רצוי.
- **"new slide, not in interactive"**: שקף חדש במצגת לא נכנס לבד. הוספת מסך היא עבודת בנייה, ופונים לדור.
- **בדיקת ה-build ב-GitHub חייבת להיות ירוקה.** אם היא אדומה, כנראה טקסט ארוך מדי, ולא מבצעים Merge.

## דברים לדעת
- התפריט Wawiwa מופיע רק בחלון רחב של Chrome. בפעם הראשונה Google מבקש אישור, ובחשבון wiwawatech@gmail.com לוחצים Advanced ← Allow.
- **מפתח הגישה ל-GitHub (token) פג ב-6 באוקטובר 2027.** לפני התאריך הזה דור מחדש אותו, אחרת הכפתור מפסיק לעבוד.
- **הקוד והתוכן:** `/Volumes/WawiwaPRO-G40/Wawiwa/GitHub/wawiwa-activities/genai-for-marketing/s1-ai-awareness/`
- **דוח השינויים:** `/Volumes/WawiwaPRO-G40/Wawiwa/Claude Wawiwa/Curriculum/Change Reports/GFM-S01-AI-Awareness_Change_Report.docx`
- **ב-Plugin** (Wawiwa Content OS, גרסה 0.13.0) יש skill חדש בשם `wawiwa-storyline-to-code`. הוא מתאר איך ממירים בלוק Storyline נוסף באותה שיטה, למשל מפגשים 2 עד 5 או הגרסה בספרדית.

---

## English
**What changed:** the first Storyline block in lesson 1 of "Generative AI for Marketing Professionals" in Rise ("AI Awareness", 33 screens) is now a code-built interactive. It looks the same and no longer needs a Storyline file to change. Live: https://dory-ship-it.github.io/wawiwa-activities/genai-for-marketing/s1-ai-awareness/

**How it is updated:**
1. Oded edits his Google Slides deck.
2. Use **Wawiwa > Send to interactive** in the deck.
3. A GitHub pull request opens with a plain-language list of what changed. Only slides changed since the last sync are included.
4. Dor presses **Merge**. It goes live in about a minute, at the same Rise link.

**Before merging:**
- Read any "check: replaces self-study wording" flag (screens 12 and 33).
- New deck slides are never added automatically.
- Do not merge if the build check is red.

**Note:** the GitHub token expires on 6 Oct 2027. The new plugin skill `wawiwa-storyline-to-code` (v0.13.0) documents how to convert the next Storyline block.
