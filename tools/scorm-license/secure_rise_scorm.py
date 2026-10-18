#!/usr/bin/env python3
"""Lock a Rise 360 SCORM export to a Wawiwa licence in Firebase.

What it does
  1. Encrypts the course text that Rise stores inside scormcontent/index.html (AES-256-GCM).
  2. Replaces Rise's loader with a small gate: on every launch it asks Firebase for the licence.
     Firebase hands back the decryption key ONLY while the licence is valid and not expired
     (the expiry is checked by Firebase's own clock, in the database rules, not in the browser).
  3. Optionally locks the package to the client's Moodle host names.
  4. Writes the secured zip and the licence record to paste into Firebase.

Usage
  python3 secure_rise_scorm.py IN.zip --client GC --unit BUS-DM102 \
      --expires 2027-11-01 --hosts moodle.example.com [--out OUT.zip]

Nothing secret is stored in this script. The generated *.licence.json holds the key: never commit it.
"""
import argparse, base64, datetime as dt, json, os, re, secrets, sys, zipfile

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

DB = "https://scorm-licensing-default-rtdb.europe-west1.firebasedatabase.app"
HERE = os.path.dirname(os.path.abspath(__file__))
PAT = re.compile(r'return Promise\.resolve\(deserialize\("([A-Za-z0-9+/=]+)"\)\)')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("zip_in")
    ap.add_argument("--client", required=True, help="short client code, e.g. GC")
    ap.add_argument("--unit", required=True, help="unit / course code, e.g. BUS-DM102")
    ap.add_argument("--expires", required=True, help="last valid day, YYYY-MM-DD (UTC, end of day)")
    ap.add_argument("--hosts", default="", help="comma list of allowed LMS host names; empty = any host")
    ap.add_argument("--out", default="")
    ap.add_argument("--licence-id", default="", help="reuse an existing licence id (re-export of same unit)")
    a = ap.parse_args()

    exp = dt.datetime.strptime(a.expires, "%Y-%m-%d").replace(hour=23, minute=59, second=59, tzinfo=dt.timezone.utc)
    lic_id = a.licence_id or f"{a.client}-{re.sub(r'[^A-Za-z0-9]', '', a.unit)}-{secrets.token_urlsafe(12).replace('-', 'x').replace('_', 'y')}"
    key = AESGCM.generate_key(bit_length=256)
    iv = secrets.token_bytes(12)

    out = a.out or re.sub(r"\.zip$", "", a.zip_in) + f"_SECURED_{a.unit}.zip"
    gate_js = open(os.path.join(HERE, "gate.js"), encoding="utf-8").read()

    found = False
    with zipfile.ZipFile(a.zip_in) as zin, zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename == "scormcontent/index.html":
                html = data.decode("utf-8")
                m = PAT.search(html)
                if not m:
                    sys.exit("Could not find Rise course data in scormcontent/index.html - export format changed?")
                ct = AESGCM(key).encrypt(iv, m.group(1).encode("ascii"), None)
                cfg = {"db": DB, "id": lic_id, "iv": base64.b64encode(iv).decode(), "ct": base64.b64encode(ct).decode()}
                call = "return window.__wwGate(" + json.dumps(cfg) + ", deserialize)"
                html = html[:m.start()] + call + html[m.end():]
                html = html.replace("<script>", "<script>\n" + gate_js + "\n</script>\n<script>", 1)
                data = html.encode("utf-8")
                found = True
            zout.writestr(item, data)
    if not found:
        sys.exit("scormcontent/index.html not in zip - is this a Rise SCORM export?")

    record = {
        "valid": True,
        "client": a.client,
        "unit": a.unit,
        "expires": exp.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "expiresAt": int(exp.timestamp() * 1000),
        "hosts": a.hosts,
        "k": base64.b64encode(key).decode(),
        "created": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    rec_path = re.sub(r"\.zip$", "", out) + ".licence.json"
    with open(rec_path, "w") as f:
        json.dump({lic_id: record}, f, indent=2)
    print("secured zip :", out)
    print("licence id  :", lic_id)
    print("licence file:", rec_path, "(import under /licenses in Firebase; do NOT commit)")


if __name__ == "__main__":
    main()
