/* Final project (Node backend), Day 3: every learner-facing string of this Day.
   To translate: copy to strings.<lang>.js, translate the values only, keep the keys,
   then run `node ../shared/build.mjs day-3 <lang>`.
   Text between backticks is code and is never translated.
   Source: "english final project nodejs.docx", Step 4 (Login), Step 5 and Step 9 (Day 3, Day 4). */
window.FP_DAY = {
  docTitle: "Day 3: Login, JWT, auth middleware.",
  day: "Day 3",
  /* The last screen's button. It names the next Day (Step 9, Day 4) and hands over to Rise's Continue. */
  finalCta: "Day 4: History model, create and fetch items.",
  screens: [
    {
      id: "login",
      step: "Step 4 (continued):",
      title: "Authentication (JWT)",
      sections: [
        {
          heading: "Login",
          rows: [
            "Receive email and password",
            "Find user",
            "Compare password using `bcrypt`",
            "Create JWT with `userId`",
            "Return token and user info"
          ]
        }
      ],
      additions: {
        heading: "Career Assistant Additions",
        lines: ["No special changes here.", "But the UI copy in React should call the user:"],
        list: ["“Job Seeker” / “Candidate” (optional)"]
      }
    },
    {
      id: "middleware",
      step: "Step 5:",
      title: "Auth Middleware",
      create: { label: "Create:", path: "server/middleware/authMiddleware.js" },
      sections: [
        {
          label: "Responsibilities:",
          rows: [
            "Read `Authorization` header (`Bearer <token>`)",
            "Verify JWT",
            "Attach `req.user = { id: userId }`",
            "Block access if token is missing or invalid"
          ]
        }
      ],
      additions: {
        heading: "Career Assistant Additions",
        lines: ["All career data is private:"],
        list: [
          "Resume analysis results are personal",
          "History must always be filtered by `req.user.id`"
        ]
      }
    }
  ]
};
