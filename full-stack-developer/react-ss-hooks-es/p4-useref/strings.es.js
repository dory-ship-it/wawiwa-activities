/* React Hooks self-study, Práctica 4 (useRef): every learner-facing string and the data of this page.
   To translate: copy to strings.<lang>.js, translate the values only, keep the keys,
   then run `node shared/build.mjs p4-useref <lang>`.
   Text between backticks is code and is never translated. **Text** between two asterisks is bold.
   Source: planning/STORYBOARD.md, section 4.6. The code cards ran in a real Vite + React app
   (review/p3/snippet-check/): 2 clicks on ref +1 and then 2 on estado +1 show `estado: 2 | ref: 2`;
   the button focuses the field; after 5 clicks "antes" is 4. */
window.RH_PAGE = {
  docTitle: "Práctica 4 · useRef",
  name: "Práctica 4 · useRef",
  lead: "Predice, ejecuta en Cursor y compara.",
  screens: [
    {
      id: "predice-redibuja",
      type: "multi",
      step: 1,
      /* Shown after the step name, in the small line above the question */
      sub: "¿qué redibuja?",
      question: "¿Cuáles de estos cambios vuelven a dibujar el componente?",
      options: [
        { text: "`setCount(count + 1)`", correct: true },
        { text: "`refClicks.current += 1`" },
        { text: "`inputRef.current.focus()`" },
        { text: "`setName(e.target.value)`", correct: true }
      ],
      why: "Cambiar estado redibuja. Cambiar `.current` o enfocar un campo, no."
    },
    {
      id: "predice-clics",
      type: "choice",
      step: 1,
      sub: "¿qué redibuja?",
      question: "Haces 2 clics en **ref +1** y después 2 clics en **estado +1**. ¿Qué muestra al final?",
      code: {
        file: "src/RefVsState.jsx",
        lines: [
          "import { useRef, useState } from 'react';",
          "",
          "export default function RefVsState() {",
          "  const [count, setCount] = useState(0);",
          "  const refClicks = useRef(0);",
          "",
          "  return (",
          "    <div>",
          "      <p>estado: {count} | ref: {refClicks.current}</p>",
          "      <button onClick={() => setCount(count + 1)}>estado +1</button>",
          "      <button onClick={() => { refClicks.current += 1; }}>",
          "        ref +1",
          "      </button>",
          "    </div>",
          "  );",
          "}"
        ]
      },
      options: [
        { text: "`estado: 2 | ref: 0`" },
        {
          text: "`estado: 2 | ref: 2`",
          correct: true,
          why: "La ref guardó sus 2 clics sin redibujar. El primer clic de estado redibujó y los mostró."
        },
        { text: "`estado: 4 | ref: 2`" }
      ]
    },
    {
      id: "tarea-foco",
      type: "steps",
      step: 2,
      /* The task, word for word from the current Spanish lesson */
      task: "Usa una referencia para acceder a un campo de texto y un botón que, al hacer clic, enfoque el campo.",
      steps: [
        "Crea `src/FocusInput.jsx` con `useRef(null)`.",
        "Conecta la ref al `<input>` con `ref={...}`.",
        "El botón llama a `.current.focus()`.",
        "Haz clic y mira dónde está el cursor."
      ],
      button: "Lo construí"
    },
    {
      id: "tarea-previo",
      type: "steps",
      step: 2,
      /* The task, word for word from the current Spanish lesson */
      task: "Usa useRef para rastrear el valor previo de una variable de estado.",
      steps: [
        "Crea `src/PreviousValue.jsx` con un contador que empiece en 0.",
        "Guarda `count` en una ref dentro de un `useEffect` con `[count]`.",
        "Muestra «Ahora» y «antes».",
        "Haz **5** clics."
      ],
      button: "Lo construí"
    },
    {
      id: "compara",
      type: "value",
      step: 3,
      question: "Después de 5 clics, ¿qué número dice “antes”?",
      expected: ["4"],
      ok: "",
      hints: [
        {
          when: ["undefined"],
          text: "Si usas `let`, la variable se crea de nuevo en cada render. Usa `useRef`."
        },
        {
          when: ["5"],
          text: "Guardas el valor durante el render, antes de dibujar. Guárdalo dentro de `useEffect`."
        },
        {
          /* Any other value */
          any: true,
          text: "Lo medido es 4. Compara tu código con la solución."
        }
      ]
    },
    {
      id: "solucion",
      type: "solution",
      step: 3,
      /* Two files: shown as two tabs of one card */
      code: [
        {
          file: "src/FocusInput.jsx",
          lines: [
            "import { useRef } from 'react';",
            "",
            "export default function FocusInput() {",
            "  const inputRef = useRef(null);",
            "",
            "  function handleFocus() {",
            "    inputRef.current.focus();",
            "  }",
            "",
            "  return (",
            "    <div>",
            "      <input ref={inputRef} type=\"text\" />",
            "      <button onClick={handleFocus}>Enfocar</button>",
            "    </div>",
            "  );",
            "}"
          ]
        },
        {
          file: "src/PreviousValue.jsx",
          lines: [
            "import { useEffect, useRef, useState } from 'react';",
            "",
            "export default function PreviousValue() {",
            "  const [count, setCount] = useState(0);",
            "  const prevCountRef = useRef(null);",
            "",
            "  useEffect(() => {",
            "    prevCountRef.current = count;",
            "  }, [count]);",
            "",
            "  return (",
            "    <div>",
            "      <p>Ahora: {count}, antes: {String(prevCountRef.current)}</p>",
            "      <button onClick={() => setCount(count + 1)}>+1</button>",
            "    </div>",
            "  );",
            "}"
          ]
        }
      ],
      note: "Cursor puede marcar “Cannot access refs during render”. La guía actual de React prefiere no leer refs al dibujar; aquí lo hacemos a propósito, porque la tarea pide useRef."
    },
    {
      id: "resumen",
      type: "takeaway",
      step: 3,
      points: [
        "**Lo que se ve va en estado.**",
        "**Lo que solo hay que recordar, o tocar en la página, va en una ref.**",
        "**Cambiar `.current` no redibuja.**"
      ],
      back: "Continúa abajo con el siguiente video."
    }
  ]
};
