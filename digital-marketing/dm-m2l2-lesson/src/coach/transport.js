// The coach's only way out of the page, one function. CO1 (offline mode): no network code here or
// anywhere in src/coach; ask() always answers { offline: true }, so the panel shows the screen's tip.
// CO2 keeps it offline: the live coach is Dor's page framed in the panel (live.js), which makes its own
// calls; this answers the fallback chip when that page is not there.
// request: { screen, kind, question } (question null: the panel asks whether the live coach is there).
// Nothing the learner types is kept: not in the lesson state, not in localStorage.
export async function ask(request) {
  return { offline: true };
}
