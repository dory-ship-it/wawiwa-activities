/* React Hooks self-study, check-in (self-check): English strings and data of this page.
   Same keys as strings.es.js. Build: `node shared/build.mjs checkin en` writes index.en.html.
   Text between backticks is code and is never translated. **Text** between two asterisks is bold. */
window.RH_PAGE = {
  docTitle: "Self-check: React Hooks",
  name: "Self-check: React Hooks",
  lead: "Five questions, one per video. Each answer is checked at once.",
  checkin: true,
  shuffle: true,
  screens: [
    {
      id: "p1",
      type: "choice",
      question: "A component has `let total = 0;` and a button that does `total = total + 1`. What does it show after 2 clicks?",
      options: [
        { text: "0", correct: true, why: "A plain variable does not re-render. That is what `useState` is for." },
        { text: "2" },
        { text: "1" }
      ]
    },
    {
      id: "p2",
      type: "choice",
      question: "`useEffect(() => { … }, [query])`. When does it run?",
      options: [
        { text: "On mount and every time `query` changes", correct: true, why: "The array lists what the effect depends on." },
        { text: "Only on mount" },
        { text: "After every render" }
      ]
    },
    {
      id: "p3",
      type: "choice",
      question: "When does React run the function an effect returns?",
      options: [
        { text: "Before repeating the effect and on unmount", correct: true, why: "That is how what the effect started gets stopped." },
        { text: "Only when there is an error" },
        { text: "Never, you have to call it by hand" }
      ]
    },
    {
      id: "p4",
      type: "choice",
      question: "You do `countRef.current = 5` inside a click. What happens on screen?",
      options: [
        { text: "Nothing, until the next render", correct: true, why: "Changing a ref does not re-render." },
        { text: "It shows 5 at once" },
        { text: "An error appears" }
      ]
    },
    {
      id: "p5",
      type: "choice",
      question: "`fetch('/users/999')` answers 404. What does `fetch` do?",
      options: [
        { text: "It resolves normally; you have to check `res.ok`", correct: true, why: "`fetch` rejects only if the network fails." },
        { text: "It rejects and goes into `catch`" },
        { text: "It returns `null`" }
      ]
    },
    {
      id: "fin",
      type: "takeaway",
      title: "You finished the lesson."
    }
  ]
};
