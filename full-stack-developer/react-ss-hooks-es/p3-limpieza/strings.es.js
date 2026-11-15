/* React Hooks self-study, Práctica 3 (limpieza de efectos): every learner-facing string and the data of this page.
   To translate: copy to strings.<lang>.js, translate the values only, keep the keys,
   then run `node shared/build.mjs p3-limpieza <lang>`.
   Text between backticks is code and is never translated. **Text** between two asterisks is bold.
   Source: planning/STORYBOARD.md, section 4.5. The code cards ran in a real Vite + React app
   (review/p3/snippet-check/): without cleanup 2 resizes print 4 lines and 1 resize after hiding prints 2;
   the timer prints iniciado, detenido, iniciado on load, detenido on hide and the same three on show. */

/* The same component is shown on the two prediction screens. */
var windowSize = [
  "import { useEffect } from 'react';",
  "",
  "export default function WindowSize() {",
  "  useEffect(() => {",
  "    const handleResize = () => console.log('resize');",
  "    window.addEventListener('resize', handleResize);",
  "  }, []);",
  "",
  "  return <p>Cambia el tamaño de la ventana.</p>;",
  "}"
];

window.RH_PAGE = {
  docTitle: "Práctica 3 · Limpieza",
  name: "Práctica 3 · Limpieza",
  lead: "Predice, ejecuta en Cursor y compara.",
  screens: [
    {
      id: "predice-consola",
      type: "choice",
      step: 1,
      /* Shown after the step name, in the small line above the question */
      sub: "encuentra lo que falta",
      question: "Este componente escucha cuando cambia el tamaño de la ventana. Lo ocultas y cambias el tamaño otra vez. ¿Qué pasa en la consola?",
      code: { file: "src/WindowSize.jsx", lines: windowSize },
      options: [
        {
          text: "No imprime nada",
          why: "Eso pasa solo si el efecto devuelve una función que quite el listener."
        },
        {
          text: "Sigue imprimiendo, y cada cambio sale dos veces en desarrollo",
          correct: true,
          why: "Sin limpieza, los dos listeners de StrictMode siguen vivos después de desmontar."
        },
        {
          text: "Imprime una vez",
          why: "StrictMode montó dos veces y agregó dos listeners."
        }
      ]
    },
    {
      id: "predice-falta",
      type: "choice",
      step: 1,
      sub: "encuentra lo que falta",
      question: "¿Qué le falta?",
      code: { file: "src/WindowSize.jsx", hl: [6], lines: windowSize },
      options: [
        {
          text: "`window.removeEventListener('resize', handleResize);` justo después de agregarlo",
          why: "Lo quitaría al instante: el componente nunca escucharía nada."
        },
        {
          text: "Agregar `[handleResize]` al arreglo",
          /* Measured: the card with this change stops with "handleResize is not defined".
             The storyboard text was: «`handleResize` se crea en cada efecto; eso no quita el listener viejo.» */
          why: "`handleResize` solo existe dentro del efecto. En el arreglo da el error «handleResize is not defined» y la página se rompe."
        },
        {
          /* The test inserts this line after line 6 and runs the card again */
          text: "`return () => window.removeEventListener('resize', handleResize);`",
          correct: true
        }
      ]
    },
    {
      id: "ejecuta",
      type: "steps",
      step: 2,
      /* The task, word for word from the current Spanish lesson */
      task: "Usa setInterval para crear un temporizador y límpialo con clearInterval cuando el componente se desmonte.",
      steps: [
        "Crea `src/Timer.jsx`. Al iniciar imprime exactamente `Temporizador iniciado`; en la limpieza, `Temporizador detenido`.",
        "En `App.jsx`, agrega un botón que oculte y muestre `<Timer />`; empieza visible (como en la Práctica 1).",
        "Recarga, espera 3 segundos, ocúltalo y vuelve a mostrarlo.",
        "Copia la consola."
      ],
      button: "Lo construí"
    },
    {
      id: "predice-orden",
      type: "order",
      step: 2,
      sub: "predice antes de pegar",
      question: "Ocultas el temporizador y lo vuelves a mostrar. ¿Qué imprime la consola desde que haces clic en ocultar? Haz clic en las líneas en ese orden.",
      /* The lines offered, and the measured order */
      lines: ["Temporizador iniciado", "Temporizador iniciado", "Temporizador detenido", "Temporizador detenido"],
      answer: ["Temporizador detenido", "Temporizador iniciado", "Temporizador detenido", "Temporizador iniciado"],
      why: "Ocultar ejecuta la limpieza. Al mostrarlo de nuevo, StrictMode prueba el montaje otra vez: iniciado, detenido, iniciado."
    },
    {
      id: "pega",
      type: "paste",
      step: 3,
      question: "Pega tu consola completa, desde la recarga.",
      /* `text` is the line the page looks for in what was pasted; `short` is what its chip shows */
      known: [
        { text: "Temporizador iniciado", short: "iniciado" },
        { text: "Temporizador detenido", short: "detenido" }
      ],
      /* Measured. The numbers are positions in `known`, starting at 0 */
      expected: [
        { label: "Al cargar", lines: [0, 1, 0] },
        { label: "Al ocultar", lines: [1] },
        { label: "Al mostrar", lines: [0, 1, 0] }
      ],
      ok: "Tu limpieza corre al desmontar y en cada prueba de StrictMode.",
      /* Shown when that line (a position in `known`) is nowhere in what was pasted */
      missing: [
        {
          line: 1,
          text: "Al ocultar no se imprimió “Temporizador detenido”: revisa que el efecto devuelva la función de limpieza."
        }
      ],
      other: "Recarga, espera 3 segundos, oculta, muestra y copia toda la consola.",
      none: "Usa exactamente los dos textos del paso 2."
    },
    {
      id: "reloj",
      type: "choice",
      step: 3,
      question: "¿Cómo avanzó tu reloj?",
      options: [
        {
          text: "De 2 en 2",
          why: "Hay dos intervalos vivos: falta la limpieza."
        },
        {
          text: "De 1 en 1",
          correct: true,
          why: "Un solo intervalo vivo."
        },
        {
          text: "Se quedó en 1",
          why: "Usa `setSeconds((s) => s + 1)`: con `seconds + 1`, el intervalo recuerda el 0."
        },
        {
          text: "Cada vez más rápido",
          why: "¿Pusiste `seconds` en el arreglo sin limpieza? Cada segundo nace un intervalo nuevo."
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
          file: "src/Timer.jsx",
          lines: [
            "import { useEffect, useState } from 'react';",
            "",
            "export default function Timer() {",
            "  const [seconds, setSeconds] = useState(0);",
            "",
            "  useEffect(() => {",
            "    console.log('Temporizador iniciado');",
            "    const id = setInterval(() => {",
            "      setSeconds((s) => s + 1);",
            "    }, 1000);",
            "    return () => {",
            "      clearInterval(id);",
            "      console.log('Temporizador detenido');",
            "    };",
            "  }, []);",
            "",
            "  return <p>{seconds}</p>;",
            "}"
          ]
        },
        {
          file: "src/App.jsx",
          lines: [
            "import { useState } from 'react';",
            "import Timer from './Timer';",
            "",
            "export default function App() {",
            "  const [isVisible, setIsVisible] = useState(true);",
            "",
            "  return (",
            "    <div>",
            "      <button onClick={() => setIsVisible(!isVisible)}>",
            "        {isVisible ? 'Ocultar' : 'Mostrar'}",
            "      </button>",
            "      {isVisible && <Timer />}",
            "    </div>",
            "  );",
            "}"
          ]
        }
      ]
    },
    {
      id: "resumen",
      type: "takeaway",
      step: 3,
      points: [
        "**Si un efecto inicia algo, su limpieza lo detiene.**",
        "**React limpia antes de repetir el efecto, al desmontar y, en desarrollo, en cada montaje de prueba.**",
        "**Dentro de un intervalo, usa la forma con función** `s => s + 1`."
      ],
      back: "Continúa abajo con el siguiente video."
    }
  ]
};
