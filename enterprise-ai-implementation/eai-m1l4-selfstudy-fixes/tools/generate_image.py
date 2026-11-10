"""Generate an image with Gemini (Nano Banana Pro) for the EAI self-study module.

Usage (from the module folder, PowerShell):
  python tools/generate_image.py --prompt-file assets/img/prompts/dana-portrait.md --out assets/img/dana.jpg --aspect 4:5 --ref assets/img/refs/style-office-team.jpg

The API key is read ONLY from the GEMINI_API_KEY environment variable
(or, as a fallback, from a git-ignored .env file in the module folder).
It is never printed, logged or written anywhere.
"""
import argparse
import datetime
import io
import os
import sys
from pathlib import Path

MODULE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_MODEL = "gemini-3-pro-image-preview"
ASPECTS = ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"]


def fail(msg):
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(1)


def load_key():
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if key:
        return key
    env_file = MODULE_DIR / ".env"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            if line.strip().startswith("GEMINI_API_KEY="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    fail("GEMINI_API_KEY is not set. Run: setx GEMINI_API_KEY \"your-key\" and reopen the terminal.")


def read_prompt(path):
    text = Path(path).read_text(encoding="utf-8")
    # Use only the text under '## Prompt' if the file has that heading; otherwise the whole file.
    if "## Prompt" in text:
        text = text.split("## Prompt", 1)[1]
        if "\n## " in text:
            text = text.split("\n## ", 1)[0]
    return text.strip()


def main():
    p = argparse.ArgumentParser(description="Generate one image with Gemini.")
    p.add_argument("--prompt-file", required=True)
    p.add_argument("--out", required=True, help="Output path, .jpg or .png")
    p.add_argument("--ref", action="append", default=[], help="Reference image (up to 3)")
    p.add_argument("--aspect", default="16:9", choices=ASPECTS)
    p.add_argument("--size", default="2K", choices=["1K", "2K", "4K"])
    args = p.parse_args()

    if len(args.ref) > 3:
        fail("Use at most 3 reference images.")
    for r in args.ref:
        if not Path(r).exists():
            fail(f"Reference image not found: {r}")

    try:
        from google import genai
        from google.genai import types
        from PIL import Image
    except ImportError:
        fail("Missing libraries. Run: pip install google-genai pillow")

    prompt = read_prompt(args.prompt_file)
    model = os.environ.get("GEMINI_IMAGE_MODEL", DEFAULT_MODEL)
    client = genai.Client(api_key=load_key())

    contents = [prompt] + [Image.open(r) for r in args.ref]
    try:
        image_config = types.ImageConfig(aspect_ratio=args.aspect, image_size=args.size)
    except Exception:
        image_config = types.ImageConfig(aspect_ratio=args.aspect)
    config = types.GenerateContentConfig(response_modalities=["IMAGE"], image_config=image_config)

    try:
        resp = client.models.generate_content(model=model, contents=contents, config=config)
    except Exception as e:  # never echo the key; the SDK does not include it in messages
        msg = str(e)
        if "billing" in msg.lower() or "FAILED_PRECONDITION" in msg:
            fail("Billing is not enabled (or the free tier has no quota for this model). Enable billing for the key's project in Google AI Studio.\nGoogle says: " + msg[:300])
        if "not found" in msg.lower() or "404" in msg:
            fail(f"Model '{model}' was not found. Check the current Gemini image model id and set GEMINI_IMAGE_MODEL.")
        if "API key" in msg or "PERMISSION_DENIED" in msg or "401" in msg or "403" in msg:
            fail("The API key was rejected. Check GEMINI_API_KEY.")
        fail(f"Gemini request failed: {msg[:400]}")

    data = None
    try:
        for part in resp.candidates[0].content.parts:
            if getattr(part, "inline_data", None) and part.inline_data.data:
                data = part.inline_data.data
                break
    except (IndexError, AttributeError, TypeError):
        pass
    if not data:
        reason = ""
        try:
            reason = f" (finish reason: {resp.candidates[0].finish_reason})"
        except Exception:
            pass
        fail("No image returned, possibly blocked by a safety filter" + reason + ". Adjust the prompt.")

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    img = Image.open(io.BytesIO(data))
    if out.suffix.lower() in (".jpg", ".jpeg"):
        img.convert("RGB").save(out, "JPEG", quality=90)
    else:
        img.save(out)

    stamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    refs = ", ".join(args.ref) if args.ref else "none"
    sidecar = out.with_name(out.name + ".prompt.md")
    sidecar.write_text(
        f"# {out.name}\n\n- Model: {model}\n- Date: {stamp}\n- Aspect: {args.aspect}, size {args.size}\n"
        f"- References: {refs}\n- Prompt file: {args.prompt_file}\n\n## Prompt\n{prompt}\n",
        encoding="utf-8",
    )
    sources = out.parent / "SOURCES.md"
    if not sources.exists():
        sources.write_text("# Image sources\n\nGenerator, model and prompt for every image (licensing and regeneration).\n\n", encoding="utf-8")
    with sources.open("a", encoding="utf-8") as f:
        f.write(f"- `{out.name}`: Gemini {model}, {stamp}, prompt in `{sidecar.name}`, refs: {refs}\n")

    print(f"Saved {out} ({img.width}x{img.height}) and {sidecar.name}")


if __name__ == "__main__":
    main()
