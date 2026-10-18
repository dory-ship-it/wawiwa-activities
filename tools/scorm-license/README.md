# SCORM licence lock (Rise 360 + Firebase)

Locks a Rise SCORM export to a Wawiwa licence, for clients that host the SCORM on their own LMS
(first use: Greystone Canada, Oct 2026). Free: Firebase Spark plan, project `scorm-licensing`.

1. Export the course from Rise as SCORM 1.2.
2. `python3 secure_rise_scorm.py export.zip --client GC --unit BUS-DM102 --expires 2027-11-01 --hosts <their moodle host>`
3. Import the generated `*.licence.json` under `/licenses` in the Realtime Database (never commit it).
4. Send the `_SECURED_` zip.

On every launch the package asks Firebase for its licence. Firebase returns the decryption key only while
`valid` is true and `expiresAt` is in the future (checked by Firebase's clock in `database.rules.json`).
Turn a licence off: set `valid` to false. Launch log: `/launches/<licence id>`.

Limits: images and media files inside the zip are not encrypted; someone who captured the key while the
licence was live could decrypt that copy. Slides come from the S3 secure viewer, which has its own
domain allowlist: remove the client's domain there when the licence ends.

## בעברית
כלי שנועל חבילת SCORM מ-Rise לרישיון ב-Firebase. הטקסט של הקורס מוצפן בתוך החבילה, והמפתח
נמסר מ-Firebase רק כל עוד הרישיון בתוקף ולא פג. כיבוי רישיון: valid = false.

## Rise export formats (added 18 Oct 2026)
Rise changed its SCORM export in Oct 2026: the course text now sits in `scormcontent/runtime-data.js`
as `__jsonp("runtime-data.js","<base64>")`, not inside `index.html`. The script detects the format and
encrypts whichever one it finds. In the new format the gate code lives inside runtime-data.js itself.
Rise's loader waits up to 10 seconds for that file, which is enough for the Firebase check.
Tested with a mock LMS + mock Firebase: valid -> course opens; expired (401), wrong host, wrong key,
no network -> "This course is not available" screen.

**Importing licence records safely:** in the Firebase console open `/licenses`, add a child with the
licence id as key, then import the record file **at that child path** (`/licenses/<id>`).
Never import at `/licenses` itself: an import replaces the whole node and would delete the other clients' keys.

### פורמט ייצוא חדש של Rise (18.10.2026)
מאוקטובר 2026 Rise שומר את תוכן הקורס בקובץ `scormcontent/runtime-data.js`. הסקריפט מזהה את הפורמט לבד ומצפין אותו.
ייבוא רשומת רישיון: רק בנתיב `/licenses/<id>` – אף פעם לא על `/licenses` עצמו (זה מוחק את המפתחות של שאר הלקוחות).
