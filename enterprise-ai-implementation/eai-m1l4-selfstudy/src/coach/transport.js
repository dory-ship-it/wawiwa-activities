// The coach's only way out of the page, one function. CO1 (offline mode): no network code here or
// anywhere in src/coach; ask() always answers { offline: true }, so the panel shows the screen's tip.
// A later run swaps this body for the Practice Studio engine's transport (after Dor approves the live
// coach for this lesson); the panel already treats any answer with offline: true as the tip fallback.
// request: { screen, kind, question } (question null: the panel asks whether the live coach is there).
// Nothing the learner types is kept: not in the lesson state, not in localStorage.
export async function ask(request) {
  return { offline: true };
}
