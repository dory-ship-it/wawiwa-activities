/* React Hooks self-study, Práctica 2 (useEffect): every learner-facing string and the data of this page.
   To translate: copy to strings.<lang>.js, translate the values only, keep the keys,
   then run `node shared/build.mjs p2-useeffect <lang>`.
   Text between backticks is code and is never translated. **Text** between two asterisks is bold.
   Source: planning/STORYBOARD.md, section 4.4. The code cards ran in a real Vite + React app
   (review/p3/snippet-check/): mount prints A B C A B C, a click on +1 prints A C, two letters print A A;
   the first user's name is Leanne Graham. */

/* The same component is shown on three screens: the two predictions and the Copy card. */
var threeEffects = [
  "import { useEffect, useState } from 'react';",
  "",
  "export default function ThreeEffects() {",
  "  const [count, setCount] = useState(0);",
  "  const [name, setName] = useState('');",
  "",
  "  useEffect(() => { console.log('A: sin arreglo'); });",
  "  useEffect(() => { console.log('B: arreglo vacío'); }, []);",
  "  useEffect(() => { console.log('C: depende de count'); }, [count]);",
  "",
  "  return (",
  "    <div>",
  "      <button onClick={() => setCount(count + 1)}>+1</button>",
  "      <input value={name} onChange={(e) => setName(e.target.value)} />",
  "      <p>{count}</p>",
  "    </div>",
  "  );",
  "}"
];

window.RH_PAGE = {
  docTitle: "Práctica 2 · useEffect",
  name: "Práctica 2 · useEffect",
  lead: "Predice, ejecuta en Cursor y compara.",
  screens: [
    {
      id: "predice-clic",
      type: "multi",
      step: 1,
      /* Shown after the step name, in the small line above the question */
      sub: "¿cuándo se ejecuta?",
      question: "El componente ya se montó. Haces clic en **+1**. ¿Qué efectos se ejecutan?",
      code: { file: "src/ThreeEffects.jsx", hl: [7, 8, 9], lines: threeEffects },
      /* The option texts are the three lines the component prints */
      options: [
        { text: "`A: sin arreglo`", correct: true },
        { text: "`B: arreglo vacío`" },
        { text: "`C: depende de count`", correct: true }
      ],
      why: "A corre después de cada render. C corre porque `count` cambió. B solo corre al montar."
    },
    {
      id: "predice-letra",
      type: "multi",
      step: 1,
      sub: "¿cuándo se ejecuta?",
      question: "Ahora escribes una letra en el campo. ¿Qué efectos se ejecutan?",
      code: { file: "src/ThreeEffects.jsx", hl: [7, 8, 9], lines: threeEffects },
      options: [
        { text: "`A: sin arreglo`", correct: true },
        { text: "`B: arreglo vacío`" },
        { text: "`C: depende de count`" }
      ],
      why: "Escribir cambia `name`, no `count`. Solo A, que corre después de cada render."
    },
    {
      id: "ejecuta",
      type: "steps",
      step: 2,
      title: "Ejecuta el componente en Cursor y mira la consola.",
      copy: { file: "src/ThreeEffects.jsx", lines: threeEffects },
      steps: [
        "Crea `src/ThreeEffects.jsx` y pega el código (botón Copiar).",
        "Agrégalo en `App.jsx` y abre la consola del navegador.",
        "Recarga, haz clic una vez en +1 y escribe 2 letras.",
        "Copia la consola: la pegas en la siguiente pantalla."
      ]
    },
    {
      id: "pega",
      type: "paste",
      step: 2,
      question: "Pega aquí tu consola y compárala con lo esperado.",
      /* `text` is the line the page looks for in what was pasted; `short` is what its chip shows */
      known: [
        { text: "A: sin arreglo", short: "A" },
        { text: "B: arreglo vacío", short: "B" },
        { text: "C: depende de count", short: "C" }
      ],
      /* Measured. The numbers are positions in `known`, starting at 0 */
      expected: [
        { label: "Al montar", lines: [0, 1, 2, 0, 1, 2] },
        { label: "Clic en +1", lines: [0, 2] },
        { label: "2 letras", lines: [0, 0] }
      ],
      /* No text after "Coincide.": the note below says what matters */
      ok: "",
      other: "Recarga, haz un clic en +1, escribe 2 letras y copia toda la consola.",
      none: "Copia toda la consola, con las líneas A, B y C, y pégala de nuevo.",
      /* Always shown next to the comparison */
      note: "¿Viste A, B y C dos veces al montar? Es StrictMode: en desarrollo, React monta, desmonta y vuelve a montar. En producción, una sola vez."
    },
    {
      id: "tarea",
      type: "steps",
      step: 2,
      /* The task, word for word from the current Spanish lesson */
      task: "Obtén los datos de la API https://jsonplaceholder.typicode.com/users y muestra el nombre del primer usuario.",
      steps: [
        "Crea `src/FirstUser.jsx` con un estado que empieza en `null`.",
        "Haz el `fetch` dentro de un `useEffect` con arreglo vacío.",
        "Mientras no hay datos, muestra «Cargando...».",
        "Agrégalo en `App.jsx`."
      ],
      button: "Lo construí"
    },
    {
      id: "compara",
      type: "value",
      step: 3,
      question: "¿Qué nombre muestra tu pantalla?",
      expected: ["Leanne Graham"],
      ok: "",
      hints: [
        {
          when: ["Ervin Howell"],
          text: "Ese es el usuario 2. `/users` devuelve una lista: el primero es `[0]`."
        },
        {
          /* Any other name */
          any: true,
          text: "Revisa que muestres `.name` del elemento `[0]` de la lista."
        }
      ]
    },
    {
      id: "solucion",
      type: "solution",
      step: 3,
      code: {
        file: "src/FirstUser.jsx",
        lines: [
          "import { useEffect, useState } from 'react';",
          "",
          "export default function FirstUser() {",
          "  const [users, setUsers] = useState(null);",
          "",
          "  useEffect(() => {",
          "    fetch('https://jsonplaceholder.typicode.com/users')",
          "      .then((res) => res.json())",
          "      .then((data) => setUsers(data));",
          "  }, []);",
          "",
          "  return <p>{users ? users[0].name : 'Cargando...'}</p>;",
          "}"
        ]
      },
      note: "En la pestaña Network verás 2 solicitudes en desarrollo: es StrictMode."
    },
    {
      id: "resumen",
      type: "takeaway",
      step: 3,
      points: [
        "**El arreglo decide cuándo.** Sin arreglo: cada render. `[]`: al montar. `[x]`: cuando `x` cambia.",
        "**Un fetch sin arreglo no para nunca.**",
        "**En desarrollo, todo efecto de montaje corre dos veces.**"
      ],
      back: "Continúa abajo con el siguiente video."
    }
  ]
};
