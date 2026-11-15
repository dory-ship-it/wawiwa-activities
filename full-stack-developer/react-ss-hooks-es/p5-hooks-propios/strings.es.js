/* React Hooks self-study, Práctica 5 (hooks personalizados): every learner-facing string and the data of this page.
   To translate: copy to strings.<lang>.js, translate the values only, keep the keys,
   then run `node shared/build.mjs p5-hooks-propios <lang>`.
   Text between backticks is code and is never translated. **Text** between two asterisks is bold.
   Source: planning/STORYBOARD.md, section 4.7. The code cards ran in a real Vite + React app
   (review/p3/snippet-check/): with `hola` stored by hand the page greets «invitado» and the hook stores `""`;
   a typed name is stored between quotes; `/users/999` shows «Error 404»; with no network, «Failed to fetch». */

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
    "      <h1>Hola, {name || 'invitado'}</h1>",
    "      <input",
    "        value={name}",
    "        onChange={(e) => setName(e.target.value)}",
    "      />",
    "      <button onClick={() => setName('')}>Borrar nombre</button>",
    "    </div>",
    "  );",
    "}"
  ]
};

window.RH_PAGE = {
  docTitle: "Práctica 5 · Hooks personalizados",
  name: "Práctica 5 · Hooks personalizados",
  lead: "Predice, ejecuta en Cursor y compara.",
  screens: [
    {
      id: "predice-storage",
      type: "choice",
      step: 1,
      /* Shown after the step name, in the small line above the question */
      sub: "`useLocalStorage`",
      question: "Alguien guardó a mano `hola`, sin comillas, en la clave `userName`. Recargas. ¿Qué pasa?",
      code: [useLocalStorage, greeting],
      options: [
        {
          text: "Saluda a «hola»",
          why: "`hola` sin comillas no es JSON válido."
        },
        {
          text: "La página se rompe",
          why: "El `try/catch` atrapa el error."
        },
        {
          text: "Saluda a «invitado» y el hook guarda `\"\"`",
          correct: true,
          why: "`JSON.parse('hola')` falla, el `catch` devuelve el valor inicial y el efecto lo guarda."
        }
      ]
    },
    {
      id: "predice-dos",
      type: "choice",
      step: 1,
      sub: "`useLocalStorage`",
      question: "Dos componentes usan `useLocalStorage('tema', 'claro')`. Uno cambia a `oscuro`. Sin recargar, ¿qué muestra el otro?",
      options: [
        { text: "`oscuro`" },
        {
          text: "`claro`",
          correct: true,
          why: "Cada componente tiene su propio estado. localStorage cambió, pero nadie le avisó al otro."
        },
        { text: "Un error" }
      ]
    },
    {
      id: "tarea-storage",
      type: "steps",
      step: 2,
      /* The task, word for word from the current Spanish lesson */
      task: "Hook personalizado: useLocalStorage: gestiona un estado sincronizado con localStorage.",
      steps: [
        "Crea `src/useLocalStorage.js`.",
        "Úsalo en un saludo con la clave `userName`.",
        "Escribe tu nombre y recarga.",
        "Abre DevTools → Application → Local Storage y mira `userName`."
      ],
      button: "Lo construí"
    },
    {
      id: "compara-storage",
      type: "value",
      step: 3,
      question: "¿Qué texto ves en `userName`? Cópialo tal cual.",
      /* Right: any text that starts and ends with a double quote, straight or curly */
      pattern: "^[\"“”].+[\"“”]$",
      ok: "",
      hints: [
        {
          /* Any text with no quotes around it */
          any: true,
          text: "¿Guardaste con `JSON.stringify`? Sin él, un número o un objeto no vuelven igual."
        }
      ]
    },
    {
      id: "predice-url",
      type: "choice",
      step: 1,
      sub: "`useDataApi`",
      question: "La URL cambia de `/users/999` (404) a `/users/1`. Si el efecto **no** hace `setError(null)` al empezar, ¿qué muestra el componente?",
      options: [
        {
          text: "Muestra a Leanne Graham",
          why: "Eso pasa con `setError(null)`."
        },
        {
          text: "Sigue mostrando «Error 404»",
          correct: true,
          why: "El error viejo nunca se borra, y el componente revisa el error antes que los datos."
        }
      ]
    },
    {
      id: "predice-red",
      type: "choice",
      step: 1,
      sub: "`useDataApi`",
      question: "Y si no hay red, ¿qué recibe `catch`?",
      options: [
        { text: "Nada: `fetch` nunca falla" },
        {
          text: "Un 404",
          why: "Sin red no hay respuesta, ni siquiera un 404."
        },
        {
          text: "Un error «Failed to fetch»",
          correct: true,
          why: "Sin red, `fetch` sí rechaza."
        }
      ]
    },
    {
      id: "tarea-api",
      type: "steps",
      step: 2,
      /* The task, word for word from the current Spanish lesson */
      task: "Hook personalizado para obtener datos: recupera datos de una API y gestiona los estados de carga y error.",
      steps: [
        "Crea `src/useDataApi.js`.",
        "Úsalo con `https://jsonplaceholder.typicode.com/users`.",
        "Cambia la URL a `/users/999`.",
        "Mira qué muestra tu componente."
      ],
      button: "Lo construí"
    },
    {
      id: "compara-api",
      type: "value",
      step: 3,
      question: "Con `/users/999`, ¿tu componente muestra un error? Escribe sí o no.",
      /* Compared after trimming, lower-casing and removing accents, so "si" equals "sí" */
      expected: ["sí"],
      ok: "",
      hints: [
        {
          when: ["no"],
          text: "Un 404 no hace fallar a `fetch`. Revisa `res.ok` en el primer `then` y lanza el error."
        }
      ],
      /* Shown when the answer is neither of the two words */
      other: "Escribe sí o no."
    },
    {
      id: "solucion",
      type: "solution",
      step: 3,
      /* Three files: shown as three tabs of one card */
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
      note: "Cursor puede marcar “set-state-in-effect” en `setIsLoading(true)`. Es una advertencia de estilo de React; el hook funciona. Hay formas sin ella, más avanzadas."
    },
    {
      id: "resumen",
      type: "takeaway",
      step: 3,
      points: [
        "**Un hook personalizado es una función `use…` que llama a otros hooks.**",
        "**Cada componente que lo usa tiene su propio estado.**",
        "**`fetch` no falla con un 404: revisa `res.ok`.**"
      ],
      back: "Continúa abajo con la autoevaluación."
    }
  ]
};
