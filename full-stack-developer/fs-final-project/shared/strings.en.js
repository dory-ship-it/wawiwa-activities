/* Final project (Node backend): strings shared by every Day.
   To translate: copy to strings.<lang>.js, translate the values only, keep the keys.
   Text between backticks is code and is never translated.
   Source of the rules: "english final project nodejs.docx", section "Mandatory Rules". */
window.FP_SHARED = {
  lang: "en",
  dir: "ltr",
  ui: {
    logoAlt: "Wawiwa",
    back: "Back",
    rules: "Rules",
    map: "Map",
    close: "Close",
    copy: "Copy",
    copied: "Copied"
  },
  rules: {
    title: "Mandatory Rules",
    rows: [
      "Every user-related route must be protected with JWT",
      "Never store plain-text passwords",
      "Filter all data by `req.user.id`",
      "Return proper HTTP status codes",
      "Never trust client-side user IDs"
    ],
    additions: {
      heading: "Career Assistant Additions (extra mandatory rules)",
      list: [
        "Never store the AI API key on the client",
        "Save every AI result as a history item (recommended)",
        "Do not return private user fields in populate (email only)"
      ]
    }
  }
};
