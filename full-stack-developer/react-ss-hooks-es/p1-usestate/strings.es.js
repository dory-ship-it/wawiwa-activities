/* React Hooks self-study, Práctica 1 (useState): every learner-facing string and the data of this page.
   To translate: copy to strings.<lang>.js, translate the values only, keep the keys,
   then run `node shared/build.mjs p1-usestate <lang>`.
   Text between backticks is code and is never translated. **Text** between two asterisks is bold.
   Source: planning/STORYBOARD.md, section 4.3. The two code cards ran in a real Vite + React app
   (review/p3/snippet-check/): 3 clicks show 3; the message is hidden after 3 clicks. */
window.RH_PAGE = {
  docTitle: "Práctica 1 · useState",
  name: "Práctica 1 · useState",
  lead: "Predice, ejecuta en Cursor y compara.",
  screens: [
    {
      id: "predice",
      type: "choice",
      step: 1,
      question: "Este botón llama dos veces a `setCount(count + 1)` en cada clic. Empieza en 0. ¿Qué número muestra después de 3 clics?",
      code: {
        file: "Counter.jsx",
        hl: [7, 8],
        lines: [
          "import { useState } from 'react';",
          "",
          "export default function Counter() {",
          "  const [count, setCount] = useState(0);",
          "",
          "  function handleClick() {",
          "    setCount(count + 1);",
          "    setCount(count + 1);",
          "  }",
          "",
          "  return (",
          "    <div>",
          "      <p>{count}</p>",
          "      <button onClick={handleClick}>Sumar</button>",
          "    </div>",
          "  );",
          "}"
        ]
      },
      options: [
        {
          text: "3",
          correct: true,
          why: "En un clic, las dos llamadas leen el mismo `count`, así que las dos piden el mismo número. Suma 1 por clic."
        },
        {
          text: "6",
          why: "Las dos llamadas leen el `count` de ese render. Las dos piden `count + 1`, no `count + 2`."
        },
        {
          text: "0",
          why: "`setCount` sí cambia el estado y React redibuja. La pregunta es cuánto suma cada clic."
        }
      ],
      /* Shown under the feedback once the right option is chosen */
      after: "Con `setCount((c) => c + 1)` dos veces, sí llegaría a 6."
    },
    {
      id: "ejecuta",
      type: "steps",
      step: 2,
      /* The task, word for word from the current Spanish lesson */
      task: "Crea un componente con un botón que muestre y oculte un mensaje.",
      steps: [
        "En Cursor, abre tu proyecto de React con Vite y ejecuta `npm run dev`.",
        "Crea `src/ShowHideMessage.jsx` con un estado booleano que empiece en `true` (mensaje visible).",
        "Agrégalo en `App.jsx`.",
        "Haz clic 3 veces y mira el mensaje."
      ],
      button: "Lo construí"
    },
    {
      id: "compara",
      type: "value",
      step: 3,
      question: "Empieza con el mensaje visible. Después de 3 clics, ¿se ve el mensaje? Escribe sí o no.",
      /* Compared after trimming, lower-casing and removing accents, so "si" equals "sí" */
      expected: ["no"],
      ok: "3 clics invierten el booleano 3 veces, y queda oculto.",
      hints: [
        {
          when: ["sí"],
          text: "Revisa tu estado inicial: si empieza en `true`, 3 clics lo dejan en `false`."
        }
      ],
      /* Shown when the answer is neither of the two words */
      other: "Escribe sí o no."
    },
    {
      id: "solucion",
      type: "solution",
      step: 3,
      code: {
        file: "src/ShowHideMessage.jsx",
        lines: [
          "import { useState } from 'react';",
          "",
          "export default function ShowHideMessage() {",
          "  const [isVisible, setIsVisible] = useState(true);",
          "",
          "  return (",
          "    <div>",
          "      <h1>Mostrar y ocultar</h1>",
          "      <button onClick={() => setIsVisible(!isVisible)}>",
          "        {isVisible ? 'Ocultar' : 'Mostrar'}",
          "      </button>",
          "      {isVisible && <p>Este es un mensaje.</p>}",
          "    </div>",
          "  );",
          "}"
        ]
      },
      note: "Tu versión puede ser distinta y estar bien: lo importante es un estado booleano, `!` para invertirlo y `&&` para dibujar el mensaje."
    },
    {
      id: "resumen",
      type: "takeaway",
      step: 3,
      points: [
        "**El estado redibuja.** Una variable normal no.",
        "**Cada render tiene su propio valor.** Dos `setCount(count + 1)` en el mismo clic leen el mismo `count`.",
        "**Un booleano y `!`** bastan para mostrar y ocultar."
      ],
      back: "Continúa abajo con el siguiente video."
    }
  ]
};
