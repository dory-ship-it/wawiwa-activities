/* React Hooks self-study, Practice 5 (custom hooks): English strings and data of this page.
   Same keys as strings.es.js. Build: `node shared/build.mjs p5-hooks-propios en` writes index.en.html.
   Text between backticks is code and is never translated. **Text** between two asterisks is bold.
   The code cards ran in a real Vite + React app (review/p3/snippet-check/). */

/* The hook and its greeting are shown on the first prediction and again in the solution. */
var useLocalStorage = {
  file: "src/useLocalStorage.js",
  lines: [
    "import { useEffect, useState } from 'react';",
    "",
    "export function useLocalStorage(key, initialValue) {",
    "  const [storedValue, setStoredValue] = useState(() => {",
    "    try {",
    "      const item = window.localStorage.getItem(key);",
    "      return item ? JSON.parse(item) : initialValue;",
    "    } catch {",
    "      return initialValue;",
    "    }",
    "  });",
    "",
    "  useEffect(() => {",
    "    window.localStorage.setItem(key, JSON.stringify(storedValue));",
    "  }, [key, storedValue]);",
    "",
    "  return [storedValue, setStoredValue];",
    "}"
  ]
};
var greeting = {
  file: "src/Greeting.jsx",
  lines: [
    "import { useLocalStorage } from './useLocalStorage';",
    "",
    "export default function Greeting() {",
    "  const [name, setName] = useLocalStorage('userName', '');",
    "",
    "  return (",
    "    <div>",
    "      <h1>Hello, {name || 'guest'}</h1>",
    "      <input",
    "        value={name}",
    "        onChange={(e) => setName(e.target.value)}",
    "      />",
    "      <button onClick={() => setName('')}>Clear name</button>",
    "    </div>",
    "  );",
    "}"
  ]
};

window.RH_PAGE = {
  docTitle: "Practice 5 · Custom hooks",
  name: "Practice 5 · Custom hooks",
  lead: "Predict, run in Cursor and compare.",
  screens: [
    {
      id: "predice-storage",
      type: "choice",
      step: 1,
      sub: "`useLocalStorage`",
      question: "Someone stored `hello`, with no quotes, under the key `userName`. You reload. What happens?",
      code: [useLocalStorage, greeting],
      options: [
        {
          text: "It greets \"hello\"",
          why: "`hello` with no quotes is not valid JSON."
        },
        {
          text: "The page breaks",
          why: "The `try/catch` catches the error."
        },
        {
          text: "It greets \"guest\" and the hook stores `\"\"`",
          correct: true,
          why: "`JSON.parse('hello')` fails, the `catch` returns the initial value and the effect stores it."
        }
      ]
    },
    {
      id: "predice-dos",
      type: "choice",
      step: 1,
      sub: "`useLocalStorage`",
      question: "Two components use `useLocalStorage('theme', 'light')`. One changes to `dark`. Without reloading, what does the other one show?",
      options: [
        { text: "`dark`" },
        {
          text: "`light`",
          correct: true,
          why: "Each component has its own state. localStorage changed, but nobody told the other one."
        },
        { text: "An error" }
      ]
    },
    {
      id: "tarea-storage",
      type: "steps",
      step: 2,
      task: "Custom hook useLocalStorage: manage a state synchronized with localStorage.",
      steps: [
        "Create `src/useLocalStorage.js`.",
        "Use it in a greeting with the key `userName`.",
        "Type your name and reload.",
        "Open DevTools → Application → Local Storage and look at `userName`."
      ],
      button: "I built it"
    },
    {
      id: "compara-storage",
      type: "value",
      step: 3,
      question: "What text do you see in `userName`? Copy it exactly.",
      pattern: "^[\"“”].+[\"“”]$",
      ok: "",
      hints: [
        {
          any: true,
          text: "Did you store it with `JSON.stringify`? Without it, a number or an object does not come back the same."
        }
      ]
    },
    {
      id: "predice-url",
      type: "choice",
      step: 1,
      sub: "`useDataApi`",
      question: "The URL changes from `/users/999` (404) to `/users/1`. If the effect does **not** call `setError(null)` at the start, what does the component show?",
      options: [
        {
          text: "It shows Leanne Graham",
          why: "That happens with `setError(null)`."
        },
        {
          text: "It still shows \"Error 404\"",
          correct: true,
          why: "The old error is never cleared, and the component checks the error before the data."
        }
      ]
    },
    {
      id: "predice-red",
      type: "choice",
      step: 1,
      sub: "`useDataApi`",
      question: "And with no network, what does `catch` receive?",
      options: [
        { text: "Nothing: `fetch` never fails" },
        {
          text: "A 404",
          why: "With no network there is no response, not even a 404."
        },
        {
          text: "A \"Failed to fetch\" error",
          correct: true,
          why: "With no network, `fetch` does reject."
        }
      ]
    },
    {
      id: "tarea-api",
      type: "steps",
      step: 2,
      task: "Custom hook to get data: fetch data from an API and manage the loading and error states.",
      steps: [
        "Create `src/useDataApi.js`.",
        "Use it with `https://jsonplaceholder.typicode.com/users`.",
        "Change the URL to `/users/999`.",
        "See what your component shows."
      ],
      button: "I built it"
    },
    {
      id: "compara-api",
      type: "value",
      step: 3,
      question: "With `/users/999`, does your component show an error? Type yes or no.",
      expected: ["yes"],
      ok: "",
      hints: [
        {
          when: ["no"],
          text: "A 404 does not make `fetch` fail. Check `res.ok` in the first `then` and throw the error."
        }
      ],
      other: "Type yes or no."
    },
    {
      id: "solucion",
      type: "solution",
      step: 3,
      code: [
        useLocalStorage,
        greeting,
        {
          file: "src/useDataApi.js",
          lines: [
            "import { useEffect, useState } from 'react';",
            "",
            "export function useDataApi(url) {",
            "  const [data, setData] = useState(null);",
            "  const [isLoading, setIsLoading] = useState(true);",
            "  const [error, setError] = useState(null);",
            "",
            "  useEffect(() => {",
            "    setIsLoading(true);",
            "    setError(null);",
            "    fetch(url)",
            "      .then((res) => {",
            "        if (!res.ok) throw new Error(`Error ${res.status}`);",
            "        return res.json();",
            "      })",
            "      .then((json) => setData(json))",
            "      .catch((err) => setError(err))",
            "      .finally(() => setIsLoading(false));",
            "  }, [url]);",
            "",
            "  return { data, isLoading, error };",
            "}"
          ]
        }
      ],
      note: "Cursor may flag \"set-state-in-effect\" on `setIsLoading(true)`. It is a React style warning; the hook works. There are ways without it, more advanced."
    },
    {
      id: "resumen",
      type: "takeaway",
      step: 3,
      points: [
        "**A custom hook is a `use…` function that calls other hooks.**",
        "**Each component that uses it has its own state.**",
        "**`fetch` does not fail on a 404: check `res.ok`.**"
      ],
      back: "Continue below with the self-check."
    }
  ]
};
