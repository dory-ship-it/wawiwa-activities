# Generating module images (Gemini)

Every image follows `planning/IMAGE STYLE.md` (master prompt + negative). Images on the Claude Design board are references only; each screen gets its own new image for its context.

## One-time setup (Windows)
1. Google AI Studio: create an API key in a project with billing enabled.
2. PowerShell: `setx GEMINI_API_KEY "your-key"`, then reopen the terminal. Never put the key in a file in the repo (`.env` is git-ignored if you must).
3. `pip install google-genai pillow`

## Run (from this module folder)
```
python tools/generate_image.py --prompt-file assets/img/prompts/dana-portrait.md --out assets/img/dana.jpg --aspect 4:5 --ref assets/img/refs/style-office-team.jpg
```
- `--ref` up to 3 images. Style reference: `assets/img/refs/style-office-team.jpg`. After Dana is approved, use `assets/img/dana.jpg` as the face reference for every later Dana image so she stays the same person.
- `--aspect` 16:9 (default), 4:5, 3:4, 1:1 and others. `--size` 1K, 2K (default), 4K.
- Model: `gemini-3-pro-image-preview` by default; override with the env var `GEMINI_IMAGE_MODEL`.

## Output
- The image, plus `<name>.prompt.md` next to it (exact prompt, model, refs, date), plus a line in `assets/img/SOURCES.md`.
- One prompt file per screen in `assets/img/prompts/`, with the prompt under a `## Prompt` heading.
