# STORYBOARD: React Hooks self-study (Spanish), alternative to "Autoaprendizaje - Hooks"

P0, 12 Nov 2026. Work-order: `RUN ON OPUS - React Hooks self-study ES.md` (this folder). Later phases build from this file and from `films-draft.es.json`; they do not redesign.

## תקציר בעברית (לדור)

- **הסיפור:** ולריה, סטודנטית (דמות בדויה), בונה במשך שבוע אפליקציית לימוד בשם Foco ומציגה אותה לקבוצה ביום שישי. כל סרט הוא יום אחד, ובכל סרט יש טעות אמיתית שהיא כמעט עושה.
- **אורך הסרטים:** כ-11 דקות בסך הכול לפי נוסחת ה-planner של הסטודיו. זו הערכה ולא מדידה, כי הקצב של 14 תווים בשנייה נמדד על הקול האנגלי. P2 ימדוד.
- **הבדיקה הטכנית:** כל קטע קוד רץ ב-React 19.3 עם Vite 8 ו-StrictMode. ממצא מרכזי: במצב פיתוח, StrictMode מריץ כל effect פעמיים, ולכן "רץ פעם אחת" בסרטונים באנגלית הוא לא מה שהלומד יראה. הסרטים והתרגולים אומרים את זה במפורש.
- **תיקון לפקודת העבודה:** בסרטון 16 הקוד שעל המסך תקין (`.finally`), ורק הקריינות מבלבלת. הבאג האמיתי הוא שאין בדיקה של `res.ok`, ולכן 404 לא מציג שגיאה. הפירוט בסעיף 6.
- **בדיקה עוינת:** סוכן נפרד בדק את המסמך. הוא מצא שאלות ניבוי בתרגולים שהתשובה שלהן מופיעה בסרט שלפניהן, ומשפטים שנשמעים כמו פנייה ללומד. הכול תוקן, וכל טענה שלא נמדדה נמדדה בסבב שני.
- **אזהרות לינטר:** שתי משימות של הקורס (הערך הקודם עם useRef, ו-useDataApi) מקבלות אזהרה בלינטר שמגיע עם Vite. התרגולים מסבירים את זה, והשאלה עוברת לראש התחום (S5, S11).
- **בלי קטעים מהסרטונים המקוריים:** על המסך שם מופיע שם של אדם ("We love Eran"), ממשק Cursor ופאנל של אתר חיצוני. הכול נבנה בכרטיסי קוד.
- **שלוש החלטות שמחכות לך:** סעיף 9.

---

## 1. Decisions made in P0 (and where I depart from the work-order)

| # | Decision | Why |
|---|---|---|
| D1 | **No clips cut from the original MP4s.** Every film is code cards + output panels. | The recordings show a person's name in the running app ("We love Eran", video 15), Cursor/VS Code chrome, an "Update Cursor?" toast, and a third-party course site in a side panel. Nothing in the 16 videos needs the real editor. |
| D2 | **StrictMode is taught, not hidden.** F2 says effects run twice in development; F3 uses it as the reason cleanup matters. | Measured: with the Vite default `<StrictMode>`, `[]` effects run mount → cleanup → mount, a fetch is sent twice, a timer without cleanup counts 0→2→4→6→8. A learner following the English videos sees different output from what the videos promise. |
| D3 | **The film for F2 fetches `/users/2`, the practice fetches `/users`.** | Rule in `wawiwa-activities/CLAUDE.md`: films teach the method and never reveal answers. The film shows a single object; the practice needs the array and `[0]`. F3/F4/F5 cannot avoid this as fully (see open question Q2). |
| D4 | **Practices are built in the Node `-es` look, with the `fs-final-project` strings/build split.** Dark floating card, header with steps, footer progress, `fit()` scale from a fixed design size. | The work-order asks for both. The Node pages are one hand-written HTML each, so the split is new: `shared/` engine + `pN/strings.es.js`. |
| D5 | **The check-in is built in the same shell as the practices, not in Practice Studio.** | The Node `checkin-v2.html` is a Practice Studio build (light Rise skin, coach code inside). The work-order says no live AI coach and "build from strings with the shared build script". The check-in copies its shape (a few items, each checked instantly), not its engine. |
| D6 | **The P-5 solution checks `res.ok`.** The original `useDataApi` does not. | Measured: with `/users/999`, the original shows `{}` and `error` stays `null`. |
| D7 | **Code card limit: 18 lines** (most cards ≤ 14). Only the full `useDataApi` needs 18. | Shortening it would drop the `res.ok` fix or `setError(null)`. |
| D8 | **Embed size follows the repo rule, not only the work-order.** P3/P4 check fit at 680 and 1100 px (work-order) **and** measure `embedHeight` at 1000 and 760 px, taller + 16 px (`wawiwa-activities/CLAUDE.md`). | The two rules measure different things; both are needed. |
| D9 | **P-2 does not "sort 3 effects by dependency array".** It asks which effects run after a click and after typing. | Sorting the three cases is exactly F2's table, shown a minute earlier: it would test recall. The click/typing questions apply the same rule to a new situation. |
| D10 | **Practice "Predice" questions never repeat a film's numbers or answers.** P-3 predicts a `resize` listener and a re-mount; P-4 uses 2+2 clicks and 5 clicks; P-5 asks about broken JSON, two components on one key, `setError(null)` and no network. | Adversarial review found that the first draft's predictions were on screen in the film just before. All new answers were measured (section 6.2). |
| D11 | **Task wording is quoted from the current lesson, with only the first letter capitalised** ("Usa setInterval…"). | Three of the seven tasks start in lower case; on a card that reads as a typo. |
| D12 | **Two required patterns raise lint warnings, and we say so instead of hiding it.** The Vite template's own linter (oxlint) warns on reading `prevCountRef.current` during render (task 5) and on `setIsLoading(true)` / `setError(null)` at the top of `useDataApi`'s effect (task 7). | The course tasks require these patterns; the alternatives are harder for this level. Each solution screen carries a one-line note. SME items S5 and S11. |

## 2. The story (answers the four questions in `writing-a-film.md`)

| | |
|---|---|
| **Who** | Valeria, a bootcamp student (invented). She builds **Foco**, a small study app for her study group (invented). |
| **Stake** | She demos Foco to her group on Friday at five. |
| **Time passing** | One film per weekday: Monday (F1) to Friday (F5). Inside a film: "por la tarde", "a las cuatro". |
| **Cost of being wrong (lands on screen, every film)** | F1 the counter stays at 0. F2 requests that never stop. F3 the clock counts by two and keeps ticking after it is hidden. F4 "antes: undefined". F5 a wrong URL shows no error. Each was run in the lab (section 6). |

Register: warm, casual, explanatory (bright programme, not cyber). Neutral Latin-American Spanish, `tú` when the narrator speaks to the learner (practice beat only). Identifiers stay in English; strings and comments in code are Spanish.

## 3. Films

### 3.1 What P1 adds to `LessonFilm`: the `code` beat

```json
{
  "kind": "code",
  "file": "Temporizador.jsx",
  "lines": ["useEffect(() => {", "  ..."],
  "hl": [3, 6],
  "output": { "label": "Consola, al montar", "lines": ["Temporizador iniciado"], "tone": "ok" },
  "sameCard": false,
  "say": "..."
}
```

- **Card:** typeset code, JetBrains Mono, line numbers, Spanish strings/comments allowed. Up to 18 lines; the card sizes its font so 18 lines still read at 1080p. No editor chrome, no tabs, no file tree, no traffic-light dots (a filename label on the card is fine).
- **`hl`:** 1-based line numbers. Highlighted lines get the accent bar and tint; the rest dim slightly. Highlight animates in after the camera settles.
- **`output` (optional):** a panel next to (or under) the code: `label` on top, `lines` in mono. `tone: "bad"` = muted red edge, `"ok"` = teal edge. It is a plain panel, never a drawn browser, console or DevTools.
- **`sameCard: true`:** the beat reuses the previous code card (same `file` and `lines`, which it omits) and only changes `hl` and `output`. The camera does not travel; the planner may keep its `TRAVEL` frames as a pause. This is how one snippet is walked line by line.
- **Planner floor:** add `code: 175` to `FLOOR` in `scripts/plan-lesson.mjs` (same as the existing `snippet`). All estimates below assume it.
- **Style row:** the programme has no `styles` row yet. P1 asks Dor the four questions in `references/styles.md` (this lesson's guess is "bright", but P1 must ask, not assume).

### 3.2 Rules every film follows

- Ends on the practice card. The card quotes the task from the current Spanish lesson word for word (first letter capitalised, D11), including the titles ("Creación de un Temporizador").
- Narration names its subject ("Valeria crea…", "ella guarda…"): in Spanish a bare third-person verb sounds like a `tú` command. `tú` only in the practice beat. No dotted identifiers, arrows or brackets in `say` (TTS reads them badly): "el método focus de esa ref", "la propiedad ok de la respuesta", "un cuatro cero cuatro".
- Code cards that show part of a file say so in the label: "(extracto)", or "(sin imports)" for a whole hook without its import line.
- No person, partner or SME name. Valeria and Foco are invented; put this in each content file's `_source`.
- The `end` card tagline stays as in every other film ("Skilling / the World / for AI").
- Exact code per card is in `films-draft.es.json` (P2 copies it, never retypes it). Every card names the lab component it was tested as (`_test`).

### 3.3 Coverage: the 16 videos → 5 films

| Video | Content | Where now |
|---|---|---|
| 1 | state, re-render, syntax, import | F1 beats 3–5 |
| 2 | counter | F1 beats 5–6. The folder setup (`components/counter/`, optional CSS module) is not filmed: it is dictation, not a hooks idea. |
| 3 | toggle (exercise) | F1 beats 7–8 (a different toggle), solution in P-1 |
| 4 | side effects, lifecycle methods, 3 dependency cases, cleanup | F2 beats 2–4 (lifecycle in one sentence), F3 beats 5–6 |
| 5 | fetch a post | F2 beats 5–7 (`/users/2` instead of `/posts/1`: a name reads better than Latin filler) |
| 6 | scroll listener + cleanup | F3 beats 8–9 |
| 7 | document title | F2 beat 9, again as a hook in F5 beat 3 |
| 8 | first user's name (exercise) | P-2 (solution there) |
| 9 | timer + clearInterval (exercise) | F3 beats 2–7, P-3 |
| 10 | useRef: DOM, previous value, mutable box | F4 beats 2–8. The "like instance variables in classes" comparison is dropped. |
| 11 | focus an input (exercise) | F4 beats 3–4, P-4 |
| 12 | previous value (exercise) | F4 beats 5–7, P-4 |
| 13 | custom hooks: what, why, `use…`, useDocumentTitle | F5 beats 2–4. The empty `useMyCustomHook` skeleton is replaced by the real `useDocumentTitle`. |
| 14 | useLocalStorage (exercise) | F5 beats 5–6, P-5 |
| 15 | using useLocalStorage, DevTools Application tab | F5 beat 7. DevTools is not drawn; P-5 tells the learner where to look. |
| 16 | useDataApi (exercise) | F5 beats 8–10, P-5 |

### 3.4 Beats

Lengths per film are computed with the planner's own formula (`scripts/plan-lesson.mjs`: 14 characters per second, LEAD 12, TAIL 22, TRAVEL 26 frames, `code` floor 175). **The 14 chars/s was measured on the English voice; the Spanish voice's rate is not measured.** P2 reports the real lengths.

### F1 · useState  (videos 1, 2, 3)

| # | Card | On screen | say |
|---|---|---|---|
| 1 | caption | “Lunes. La demo es el viernes.” | Lunes por la mañana. Valeria tiene hasta el viernes para mostrarle a su grupo de estudio una app que se llama Foco. |
| 2 | caption | “Foco · Pomodoros: 0” | La primera pieza parece fácil: un contador de pomodoros. Cada vez que termina un bloque de estudio, un clic suma uno. |
| 3 | code | `Foco.jsx`, 11 lines, highlight 2,6; Pantalla, después de 3 clics: Pomodoros: 0 ✗ · test `CounterWithLet` | Su primer intento usa una variable normal. Hace clic tres veces, y la pantalla sigue diciendo cero. |
| 4 | caption | “El estado es un dato que, al cambiar, vuelve a dibujar el componente.” | React no se entera de ese cambio. Para que la pantalla cambie, el dato tiene que ser estado: cuando el estado cambia, React vuelve a dibujar el componente. |
| 5 | code | `Foco.jsx`, 13 lines, highlight 1,4 · test `PomodoroCounter` | Valeria importa useState desde react. Le da dos cosas: el valor actual y una función para cambiarlo. El cero es el valor con el que empieza. |
| 6 | code | `Foco.jsx` (same card), highlight 8; Pantalla, después de 3 clics: Pomodoros: 3 ✓ · test `PomodoroCounter` | El botón ya no toca una variable. Llama a setPomodoros con el valor nuevo, y React redibuja. Tres clics, tres pomodoros. |
| 7 | code | `Foco.jsx (extracto)`, 10 lines, highlight 1,5 · test `DoneTasksToggle` | Por la tarde, Valeria agrega un botón para mostrar u ocultar las tareas terminadas. Ahora el estado es verdadero o falso, y cada clic lo invierte con el signo de exclamación. |
| 8 | code | `Foco.jsx (extracto)` (same card), highlight 6,8; Pantalla, después de 1 clic: [ Ocultar terminadas ] / Repasar arrays ✓ · test `DoneTasksToggle` | Si showDone es verdadero, la tarea aparece. Si es falso, React no dibuja nada. El mismo estado decide también el texto del botón. |
| 9 | caption | “Si lo que ves depende de un dato, ese dato es estado.” | Antes de cerrar la laptop, Valeria anota una regla: si lo que se ve en pantalla depende de un dato, ese dato va en useState. |
| 10 | practice | Practice card: Uso del Estado — Crea un componente con un botón que muestre y oculte un mensaje. | Tu turno. En la práctica de abajo, predice qué muestra un contador después de tres clics, y luego construye tu propio botón para mostrar y ocultar. |
| 11 | end | End card |  |

### F2 · useEffect: cuándo se ejecuta  (videos 4, 5, 7, 8)

| # | Card | On screen | say |
|---|---|---|---|
| 1 | caption | “Martes.” | Martes. Valeria quiere que Foco muestre quién es el compañero de estudio del día. Ese dato no está en su código: vive en una API. |
| 2 | caption | “Efecto secundario: todo lo que actúa fuera del componente.” | Pedir datos a una API es un efecto secundario: algo que actúa fuera del componente, como cambiar el título de la pestaña o escuchar un evento. Para eso existe useEffect. |
| 3 | code | `Companero.jsx (extracto)`, 3 lines, highlight 1,2 · test `skeleton, not runnable on its own; the full version is Partner` | useEffect recibe una función, y React la ejecuta después de dibujar el componente. Junta en un solo lugar lo que antes, en los componentes de clase, hacían tres métodos del ciclo de vida. |
| 4 | table | ¿Cuándo se ejecuta el efecto?: sin arreglo → después de cada render; [ ] → solo al montar; [count] → al montar y cada vez que count cambia | El segundo argumento decide cuándo se repite. Sin arreglo, después de cada render. Con un arreglo vacío, solo al montar. Con count adentro, cada vez que count cambia. |
| 5 | code | `Companero.jsx (extracto)`, 7 lines, highlight 7; Network: users/2 / users/2 / users/2 / users/2 / … ✗ · test `PartnerNoDeps` | Su primera versión olvida el arreglo. Llega el dato, el estado cambia, el componente se redibuja, y el efecto vuelve a pedir el dato. Una y otra vez. |
| 6 | caption | “fetch → setPartner → render → fetch → …” | En pantalla todo se ve bien, y por eso es fácil no notarlo. Pero en la pestaña Network, las solicitudes no paran nunca. |
| 7 | code | `Companero.jsx (extracto)`, 9 lines, highlight 7; Pantalla: Compañero de hoy: Ervin Howell ✓ · test `Partner` | Un arreglo vacío al final lo arregla. El efecto ya no se repite con cada render: pide el dato al montar, y mientras espera, la pantalla dice cargando. |
| 8 | caption | “En desarrollo, StrictMode monta dos veces a propósito.” | Algo la confunde: en la pestaña Network, la solicitud aparece dos veces. No es un error. En desarrollo, StrictMode monta el componente dos veces a propósito. En producción, se pide una sola vez. |
| 9 | code | `Foco.jsx (extracto)`, 3 lines, highlight 3; Título de la pestaña: Pomodoros: 2 ✓ · test `PomodoroTitle` | Por la tarde, Valeria escribe otro efecto: el título de la pestaña muestra los pomodoros. Pone pomodoros en el arreglo, así el título cambia con cada clic, y solo entonces. |
| 10 | caption | “¿Cuándo debe repetirse este efecto? La respuesta va en el arreglo.” | La regla del martes: antes de escribir un efecto, hay que preguntarse cuándo debe repetirse. La respuesta va en el arreglo. |
| 11 | practice | Practice card: Obtener datos — Obtén los datos de la API https://jsonplaceholder.typicode.com/users y muestra el nombre del primer usuario. | Tu turno. En la práctica, decide qué efectos se ejecutan en cada momento, y luego muestra el nombre del primer usuario de la API. |
| 12 | end | End card |  |

### F3 · useEffect: limpieza  (videos 4, 6, 9)

| # | Card | On screen | say |
|---|---|---|---|
| 1 | caption | “Miércoles.” | Miércoles. Valeria le agrega a Foco un temporizador que cuenta los segundos de cada bloque de estudio. |
| 2 | code | `Temporizador.jsx (extracto)`, 8 lines, highlight 4,7; Pantalla, segundo a segundo: 0 → 2 → 4 → 6 → 8 ✗ · test `TimerNoCleanup` | Valeria usa setInterval dentro de un efecto. Pero en desarrollo, el reloj salta de dos en dos. |
| 3 | caption | “Dos montajes, dos intervalos, nadie los detiene.” | StrictMode montó el componente dos veces, y cada montaje dejó un intervalo corriendo. Nadie los detuvo. |
| 4 | code | `Temporizador.jsx (extracto)` (same card), highlight 5; Consola, con el temporizador oculto: tic / tic / tic / tic ✗ · test `TimerNoCleanup` | Y cuando oculta el temporizador, la consola sigue imprimiendo. El componente ya no está, pero sus intervalos sí. |
| 5 | caption | “La limpieza es la función que devuelve el efecto.” | La solución es la limpieza: una función que el efecto devuelve. React la ejecuta antes de repetir el efecto y cuando el componente se desmonta. |
| 6 | code | `Temporizador.jsx (extracto)`, 10 lines, highlight 3,6,7,8,9; Consola, al montar: Temporizador iniciado / Temporizador detenido / Temporizador iniciado ✓ · test `Timer` | Ella guarda el id del intervalo y devuelve una función que llama a clearInterval. Ahora la consola cuenta la historia: iniciado, detenido, iniciado. Es StrictMode probando la limpieza. |
| 7 | code | `Temporizador.jsx (extracto)` (same card), highlight 4; Si escribe setSeconds(seconds + 1): 0 → 1 → 1 → 1 ✗ · test `TimerStale` | Un detalle más: adentro del intervalo, Valeria usa la forma con función, que siempre recibe el valor más reciente. Con seconds más uno, el intervalo recuerda el cero del primer render, y el reloj se queda en uno. |
| 8 | code | `Foco.jsx (extracto)`, 5 lines, highlight 3,4 · test `ScrollWatcher` | Por la tarde, Foco escucha el scroll de la página. Es el mismo patrón: addEventListener en el efecto, removeEventListener en la limpieza. |
| 9 | caption | “Sin limpieza: cada scroll se imprime dos veces, y sigue después de cerrar la vista.” | Sin esa limpieza, cada scroll se imprimía dos veces en desarrollo, y seguía imprimiéndose después de cerrar la vista. |
| 10 | caption | “Si un efecto inicia algo, su limpieza lo detiene.” | La regla del miércoles: si un efecto inicia algo, como un intervalo o un listener, su limpieza lo detiene. |
| 11 | practice | Practice card: Creación de un Temporizador — Usa setInterval para crear un temporizador y límpialo con clearInterval cuando el componente se desmonte. | Tu turno. Encuentra la limpieza que le falta a un temporizador que nunca se detiene, constrúyelo en Cursor y compara la consola. |
| 12 | end | End card |  |

### F4 · useRef  (videos 10, 11, 12)

| # | Card | On screen | say |
|---|---|---|---|
| 1 | caption | “Jueves.” | Jueves. El grupo pide dos cosas: un botón que lleve el cursor directo al campo de nueva tarea, y ver cuántos pomodoros había antes del último clic. |
| 2 | caption | “useRef: una caja que React conserva entre renders. Cambiarla no redibuja.” | Las dos se resuelven con useRef. Es una caja con una propiedad, current, que React conserva entre renders. Cambiarla no vuelve a dibujar el componente. |
| 3 | code | `NuevaTarea.jsx`, 14 lines, highlight 4,10 · test `FocusTask` | Valeria crea inputRef con null y lo conecta al campo con el atributo ref. Después de montar, current apunta al elemento real de la página. |
| 4 | code | `NuevaTarea.jsx` (same card), highlight 6,11; Después del clic: El cursor está en «Nueva tarea» ✓ · test `FocusTask` | El botón llama al método focus de esa ref. El cursor salta al campo, sin estado y sin redibujar nada. |
| 5 | code | `Foco.jsx (extracto)`, 8 lines, highlight 2,5; Pantalla, después de 3 clics: Ahora: 3, antes: undefined ✗ · test `PrevWithLet` | Para el valor anterior, su primer intento usa una variable normal. Pero cada render crea la variable de nuevo, y la etiqueta «antes» siempre dice undefined. |
| 6 | code | `Foco.jsx (extracto)`, 8 lines, highlight 2,5; Pantalla, después de 3 clics: Ahora: 3, antes: 2 ✓ · test `PreviousValue` | Con useRef, la caja sobrevive. Después de cada render, el efecto guarda count en la ref, y el texto muestra el valor de la vez anterior. |
| 7 | caption | “Primero React dibuja y lee la caja. Después, el efecto la actualiza.” | Funciona por el orden. React dibuja primero, leyendo lo que hay en la caja, y solo después el efecto guarda el valor nuevo. |
| 8 | table | Tres clics en «ref +1», uno en «estado +1»: refClicks.current += 1 (×3) → No → estado: 0 \| ref: 0; setStateClicks(stateClicks + 1) → Sí → estado: 1 \| ref: 3 | La diferencia en una línea: cambiar el estado redibuja, cambiar una ref no. La ref sí guardó los tres clics, pero solo se ven cuando algo más redibuja. |
| 9 | caption | “Lo que se ve va en estado. Lo que solo hay que recordar va en una ref.” | La regla del jueves: lo que se ve en pantalla va en estado. Lo que solo hay que recordar, o tocar en la página sin redibujar, va en una ref. |
| 10 | practice | Practice card: Uso de Referencias y de useRef — Usa una referencia para acceder a un campo de texto y un botón que, al hacer clic, enfoque el campo. Usa useRef para rastrear el valor previo de una variable de estado. | Tu turno. Decide qué cambios provocan un nuevo render, y luego construye el botón de enfoque y el valor anterior. |
| 11 | end | End card |  |

### F5 · Hooks personalizados  (videos 13, 14, 15, 16)

| # | Card | On screen | say |
|---|---|---|---|
| 1 | caption | “Viernes. La demo es a las cinco.” | Viernes. La demo es a las cinco, y Valeria nota que tiene la misma lógica copiada en tres componentes. |
| 2 | caption | “Un hook personalizado es una función que empieza con use y llama a otros hooks.” | La solución es un hook personalizado: una función de JavaScript cuyo nombre empieza con use y que puede llamar a otros hooks. |
| 3 | code | `useDocumentTitle.js y Foco.jsx (extractos)`, 8 lines, highlight 1,8 · test `TitleWithHook` | El primero es pequeño. Valeria mueve el efecto del título a useDocumentTitle, y en el componente queda una sola línea. |
| 4 | caption | “use… le avisa al linter, y a quien lee, que adentro hay hooks.” | El prefijo use no es decoración. Le avisa al linter, y a quien lea el código, que adentro hay hooks y que se aplican sus reglas. |
| 5 | code | `useLocalStorage.js (sin imports)`, 14 lines, highlight 2,4,5 · test `Greeting` | Después, el nombre de quien usa Foco tiene que sobrevivir a una recarga. useLocalStorage lee el valor guardado una sola vez, al crear el estado. |
| 6 | code | `useLocalStorage.js (sin imports)` (same card), highlight 10,11,12,13 · test `Greeting` | Un efecto lo vuelve a guardar cada vez que cambia. Y por fuera, el hook devuelve lo mismo que useState: el valor y la función para cambiarlo. |
| 7 | code | `Saludo.jsx (extracto)`, 8 lines, highlight 1; Después de recargar la página: Hola, Vale ✓ · test `Greeting` | En el componente, una línea: useLocalStorage con la clave userName. Valeria escribe su nombre, recarga la página, y el saludo sigue ahí. |
| 8 | code | `useDataApi.js (sin imports)`, 18 lines, highlight 2,3,4,17 · test `ApiFixed` | El último es useDataApi. Recibe una URL y devuelve tres cosas: los datos, si todavía está cargando, y si hubo un error. |
| 9 | code | `useDataApi.js (sin imports)` (same card), highlight 10; Con /users/999, sin esta línea: Pantalla: {} / error: null ✗ · test `ApiOrig` | A las cuatro, Valeria prueba una URL equivocada, y no aparece ningún error. fetch solo falla cuando no hay red: un cuatro cero cuatro llega como una respuesta normal. Por eso ahora revisa la propiedad ok de la respuesta. |
| 10 | code | `useDataApi.js (sin imports)` (same card), highlight 15; Con /users/999: Error: Error 404 ✓ · test `ApiFixed` | Y el estado de carga se apaga en finally, dentro de la cadena, cuando la respuesta ya llegó, sea un dato o un error. |
| 11 | caption | “Estado · efectos · limpieza · refs · hooks propios” | A las cinco, Foco funciona. Estado para lo que se ve, efectos para lo que pasa fuera del componente, limpieza para lo que se inicia, refs para lo que no redibuja, y hooks propios para no repetirse. |
| 12 | practice | Practice card: Hooks personalizados — Hook personalizado: useLocalStorage: gestiona un estado sincronizado con localStorage. Hook personalizado para obtener datos: recupera datos de una API y gestiona los estados de carga y error. | Tu turno. Completa useLocalStorage y useDataApi, y ejecuta los dos en Cursor. |
| 13 | end | End card |  |

## 4. Practices

### 4.1 Folder and build (P3)

```
full-stack-developer/react-ss-hooks-es/
  shared/  build.mjs  practice.css  practice.js  strings.es.js  strings.en.js  fonts/  (logo)
  p1-usestate/        strings.es.js  strings.en.js  index.html (generated)  index.en.html (generated)
  p2-useeffect/       …
  p3-limpieza/        …
  p4-useref/          …
  p5-hooks-propios/   …
  checkin/            …
  planning/  review/
```

- `node shared/build.mjs p1-usestate` writes `index.html` from the `es` strings (Spanish is the primary language here, so it gets `index.html`); `node shared/build.mjs p1-usestate en` writes `index.en.html`. Never edit generated HTML.
- `shared/practice.js` is one small engine with the screen types below. Each page's `strings.<lang>.js` holds every learner-facing string **and** the page's data (code lines, options, correct answers, expected values). No text in `practice.js` or `build.mjs`.
- Fonts and the logo are local files (copy from `fs-final-project/shared/`). No network calls; the only URL is the JSONPlaceholder one the learner opens in Cursor.
- Look: the Node `-es` dark card (`node-ss16-async-fs-es/who-prints-first-v2.html` is the reference: palette, header with the three steps, mono code panel with line numbers, red primary button, teal feedback, footer progress bar, transparent page around the card). Design size 1000 × 560, scaled down with `fit()` below that. Keyboard reachable, visible focus, `aria-live` for feedback, reduced motion respected.
- Steps in the header: **1 Predice → 2 Ejecuta en Cursor → 3 Compara**.
- Word limits per screen (from the Node pages): instruction ≤ 35 words, one feedback box ≤ 30 words, steps list ≤ 4 items of ≤ 20 words.

### 4.2 Screen types for `practice.js`

| Type | What the learner does | Data in strings |
|---|---|---|
| `choice` | Picks one option; instant verdict; can retry; Continue only after correct | `code`, `question`, `options[{text, correct, why}]` |
| `multi` | Marks every option that applies, then "Comprobar" | `options[{text, correct, why}]` |
| `order` | Clicks lines into a mock console in the order expected (Node pattern) | `lines[]`, `answer[]`, `why` |
| `steps` | Reads the task and the steps, copies code if any, presses «Lo construí» | `task`, `steps[]`, `copy?` |
| `paste` | Pastes console output; the page keeps only known lines and compares with the prediction | `known[]`, `expected[]`, messages |
| `value` | Types what their screen shows; compared with the expected value (trimmed, case-insensitive, accents ignored, so "si" = "sí") | `expected`, `hints` |
| `solution` | «Ver solución» (only after the previous screen was answered or «Lo construí») shows the solution code, **with its imports**, and Copy | `code`, `note` |
| `takeaway` | Two or three points and the return line | `points[]`, `back` |

All text below is the Spanish learner text P3 puts in `strings.es.js`. Expected values were measured in the lab (section 6).

### 4.3 P-1 useState (task 1)

| # | Type | Text |
|---|---|---|
| 1 | choice | **Paso 1 · Predice.** Código: `DoubleClickPredict` (`setCount(count + 1)` dos veces en el mismo `onClick`). Pregunta: «Este botón llama dos veces a `setCount(count + 1)` en cada clic. Empieza en 0. ¿Qué número muestra después de 3 clics?» Opciones: **3** ✓ · 6 · 0. ✓ «Correcto. En un clic, las dos llamadas leen el mismo `count`, así que las dos piden el mismo número. Suma 1 por clic.» · 6 ✗ «Incorrecto. Las dos llamadas leen el `count` de ese render. Las dos piden `count + 1`, no `count + 2`.» · 0 ✗ «Incorrecto. `setCount` sí cambia el estado y React redibuja. La pregunta es cuánto suma cada clic.» Después del acierto: «Con `setCount((c) => c + 1)` dos veces, sí llegaría a 6.» |
| 2 | steps | **Paso 2 · Ejecuta en Cursor.** Tarea (texto exacto): «Crea un componente con un botón que muestre y oculte un mensaje.» Pasos: 1. En Cursor, abre tu proyecto de React con Vite y ejecuta `npm run dev`. 2. Crea `src/ShowHideMessage.jsx` con un estado booleano que empiece en `true` (mensaje visible). 3. Agrégalo en `App.jsx`. 4. Haz clic 3 veces y mira el mensaje. Botón: «Lo construí». |
| 3 | value | **Paso 3 · Compara.** «Empieza con el mensaje visible. Después de 3 clics, ¿se ve el mensaje? Escribe sí o no.» Esperado: `no`. ✓ «Correcto: 3 clics invierten el booleano 3 veces, y queda oculto.» ✗ «Revisa tu estado inicial: si empieza en `true`, 3 clics lo dejan en `false`.» |
| 4 | solution | `ShowHideMessage` (lab). Nota: «Tu versión puede ser distinta y estar bien: lo importante es un estado booleano, `!` para invertirlo y `&&` para dibujar el mensaje.» |
| 5 | takeaway | • **El estado redibuja.** Una variable normal no. • **Cada render tiene su propio valor.** Dos `setCount(count + 1)` en el mismo clic leen el mismo `count`. • **Un booleano y `!`** bastan para mostrar y ocultar. Vuelta: «Continúa abajo con el siguiente video.» |

### 4.4 P-2 useEffect (task 2)

| # | Type | Text |
|---|---|---|
| 1 | multi | **Paso 1 · Predice: ¿cuándo se ejecuta?** Código: `ThreeEffects` (A sin arreglo, B `[]`, C `[count]`). «El componente ya se montó. Haces clic en **+1**. ¿Qué efectos se ejecutan?» Correctas: **A, C**. Feedback: «A corre después de cada render. C corre porque `count` cambió. B solo corre al montar.» |
| 2 | multi | «Ahora escribes una letra en el campo. ¿Qué efectos se ejecutan?» Correcta: **A**. «Escribir cambia `name`, no `count`. Solo A, que corre después de cada render.» |
| 3 | steps + paste | **Paso 2 · Ejecuta en Cursor.** Pasos: 1. Crea `src/ThreeEffects.jsx` y pega el código (botón Copiar). 2. Agrégalo en `App.jsx` y abre la consola del navegador. 3. Recarga, haz clic una vez en +1 y escribe 2 letras. 4. Copia la consola y pégala aquí. Esperado (medido): al montar `A, B, C, A, B, C`; clic → `A, C`; 2 letras → `A, A`. Mensaje fijo junto a la comparación: «¿Viste A, B y C dos veces al montar? Es StrictMode: en desarrollo, React monta, desmonta y vuelve a montar. En producción, una sola vez.» |
| 4 | steps | Tarea (texto exacto): «Obtén los datos de la API https://jsonplaceholder.typicode.com/users y muestra el nombre del primer usuario.» Pasos: 1. Crea `src/FirstUser.jsx` con un estado que empieza en `null`. 2. Haz el `fetch` dentro de un `useEffect` con arreglo vacío. 3. Mientras no hay datos, muestra «Cargando...». 4. Agrégalo en `App.jsx`. |
| 5 | value | **Paso 3 · Compara.** «¿Qué nombre muestra tu pantalla?» Esperado: `Leanne Graham`. ✗ hints: si escribe `Ervin Howell` → «Ese es el usuario 2. `/users` devuelve una lista: el primero es `[0]`.»; otro → «Revisa que muestres `.name` del elemento `[0]` de la lista.» |
| 6 | solution | `FirstUser` (lab). Nota: «En la pestaña Network verás 2 solicitudes en desarrollo: es StrictMode.» |
| 7 | takeaway | • **El arreglo decide cuándo.** Sin arreglo: cada render. `[]`: al montar. `[x]`: cuando `x` cambia. • **Un fetch sin arreglo no para nunca.** • **En desarrollo, todo efecto de montaje corre dos veces.** |

### 4.5 P-3 Limpieza (task 3)

| # | Type | Text |
|---|---|---|
| 1 | choice | **Paso 1 · Predice: encuentra lo que falta.** Código: `ResizeNoCleanup` (un listener de `resize` sin limpieza; F3 usó `scroll` y un intervalo). «Este componente escucha cuando cambia el tamaño de la ventana. Lo ocultas y cambias el tamaño otra vez. ¿Qué pasa en la consola?» Opciones: **Sigue imprimiendo, y cada cambio sale dos veces en desarrollo** ✓ «Sin limpieza, los dos listeners de StrictMode siguen vivos después de desmontar.» · No imprime nada ✗ «Eso pasa solo si el efecto devuelve una función que quite el listener.» · Imprime una vez ✗ «StrictMode montó dos veces y agregó dos listeners.» (medido: 2 cambios → 4 líneas; 1 cambio después de ocultar → 2 líneas) |
| 2 | choice | «¿Qué le falta?» Opciones: **`return () => window.removeEventListener('resize', handleResize);`** ✓ · `window.removeEventListener('resize', handleResize);` justo después de agregarlo ✗ «Lo quitaría al instante: el componente nunca escucharía nada.» · Agregar `[handleResize]` al arreglo ✗ «`handleResize` se crea en cada efecto; eso no quita el listener viejo.» (medido con limpieza: 2 cambios → 2 líneas, después de ocultar → 0) |
| 3 | steps | **Paso 2 · Ejecuta en Cursor.** Tarea: «Usa setInterval para crear un temporizador y límpialo con clearInterval cuando el componente se desmonte.» Pasos: 1. Crea `src/Timer.jsx`. Al iniciar imprime exactamente `Temporizador iniciado`; en la limpieza, `Temporizador detenido`. 2. En `App.jsx`, agrega un botón que oculte y muestre `<Timer />`; empieza visible (como en la Práctica 1). 3. Recarga, espera 3 segundos, ocúltalo y vuelve a mostrarlo. 4. Copia la consola. |
| 4 | order | **Predice antes de pegar:** «Ocultas el temporizador y lo vuelves a mostrar. ¿Qué imprime la consola desde que haces clic en ocultar?» Líneas: `Temporizador detenido` (×2), `Temporizador iniciado` (×2). Respuesta: detenido → iniciado → detenido → iniciado. «Ocultar ejecuta la limpieza. Al mostrarlo de nuevo, StrictMode prueba el montaje otra vez: iniciado, detenido, iniciado.» (medido) |
| 5 | paste | **Paso 3 · Compara.** Conoce solo `Temporizador iniciado` y `Temporizador detenido`. Esperado completo: `iniciado, detenido, iniciado` (carga) · `detenido` (ocultar) · `iniciado, detenido, iniciado` (mostrar). ✓ «Tu limpieza corre al desmontar y en cada prueba de StrictMode.» ✗ sin `detenido` al ocultar → «Al ocultar no se imprimió “Temporizador detenido”: revisa que el efecto devuelva la función de limpieza.» ✗ otras palabras → «Usa exactamente los dos textos del paso 2.» |
| 6 | choice | «¿Cómo avanzó tu reloj?» Opciones: **De 1 en 1** ✓ «Un solo intervalo vivo.» · De 2 en 2 ✗ «Hay dos intervalos vivos: falta la limpieza.» · Se quedó en 1 ✗ «Usa `setSeconds((s) => s + 1)`: con `seconds + 1`, el intervalo recuerda el 0.» · Cada vez más rápido ✗ «¿Pusiste `seconds` en el arreglo sin limpieza? Cada segundo nace un intervalo nuevo.» (los cuatro casos medidos: 0→1→2→3, 0→2→4→6, 0→1→1→1, 0→2→5→10→19) |
| 7 | solution | `Timer` (lab) con imports + el botón mostrar/ocultar en `App.jsx`. |
| 8 | takeaway | • **Si un efecto inicia algo, su limpieza lo detiene.** • **React limpia antes de repetir el efecto, al desmontar y, en desarrollo, en cada montaje de prueba.** • **Dentro de un intervalo, usa la forma con función** `s => s + 1`. |

### 4.6 P-4 useRef (tasks 4, 5)

| # | Type | Text |
|---|---|---|
| 1 | multi | **Paso 1 · Predice: ¿qué redibuja?** «¿Cuáles de estos cambios vuelven a dibujar el componente?» Opciones: `setCount(count + 1)` ✓ · `refClicks.current += 1` ✗ · `inputRef.current.focus()` ✗ · `setName(e.target.value)` ✓. Feedback: «Cambiar estado redibuja. Cambiar `.current` o enfocar un campo, no.» (medido: `focus()` → 0 renders) |
| 2 | choice | Código: `RefVsState`. «Haces 2 clics en **ref +1** y después 2 clics en **estado +1**. ¿Qué muestra al final?» Opciones: **`estado: 2 \| ref: 2`** ✓ · `estado: 2 \| ref: 0` · `estado: 4 \| ref: 2`. ✓ «La ref guardó sus 2 clics sin redibujar. El primer clic de estado redibujó y los mostró.» (medido; F4 usa 3 + 1) |
| 3 | steps | **Paso 2 · Ejecuta en Cursor.** Tarea: «Usa una referencia para acceder a un campo de texto y un botón que, al hacer clic, enfoque el campo.» Pasos: 1. Crea `src/FocusInput.jsx` con `useRef(null)`. 2. Conecta la ref al `<input>` con `ref={...}`. 3. El botón llama a `.current.focus()`. 4. Haz clic y mira dónde está el cursor. |
| 4 | steps | Tarea: «Usa useRef para rastrear el valor previo de una variable de estado.» Pasos: 1. Crea `src/PreviousValue.jsx` con un contador que empiece en 0. 2. Guarda `count` en una ref dentro de un `useEffect` con `[count]`. 3. Muestra «Ahora» y «antes». 4. Haz **5** clics. |
| 5 | value | **Paso 3 · Compara.** «Después de 5 clics, ¿qué número dice “antes”?» Esperado: `4`. ✗ `undefined` → «Si usas `let`, la variable se crea de nuevo en cada render. Usa `useRef`.» ✗ `5` → «Guardas el valor durante el render, antes de dibujar. Guárdalo dentro de `useEffect`.» (medido: `useEffect` → 4, asignar en el render → 5) |
| 6 | solution | `FocusTask` y `PreviousValue` (lab) con imports. Nota: «Cursor puede marcar “Cannot access refs during render”. La guía actual de React prefiere no leer refs al dibujar; aquí lo hacemos a propósito, porque la tarea pide useRef.» |
| 7 | takeaway | • **Lo que se ve va en estado.** • **Lo que solo hay que recordar, o tocar en la página, va en una ref.** • **Cambiar `.current` no redibuja.** |

### 4.7 P-5 Hooks personalizados (tasks 6, 7)

| # | Type | Text |
|---|---|---|
| 1 | choice | **Paso 1 · Predice: `useLocalStorage`.** (El código de F5, completo.) «Alguien guardó a mano `hola`, sin comillas, en la clave `userName`. Recargas. ¿Qué pasa?» Opciones: **Saluda a «invitado» y el hook guarda `""`** ✓ «`JSON.parse('hola')` falla, el `catch` devuelve el valor inicial y el efecto lo guarda.» · Saluda a «hola» ✗ «`hola` sin comillas no es JSON válido.» · La página se rompe ✗ «El `try/catch` atrapa el error.» (medido) |
| 2 | choice | «Dos componentes usan `useLocalStorage('tema', 'claro')`. Uno cambia a `oscuro`. Sin recargar, ¿qué muestra el otro?» Opciones: **`claro`** ✓ «Cada componente tiene su propio estado. localStorage cambió, pero nadie le avisó al otro.» · `oscuro` ✗ · Un error ✗. (medido: caja 1 `oscuro`, caja 2 `claro`, localStorage `"oscuro"`) |
| 3 | steps | **Paso 2 · Ejecuta en Cursor.** Tarea: «Hook personalizado: useLocalStorage: gestiona un estado sincronizado con localStorage.» Pasos: 1. Crea `src/useLocalStorage.js`. 2. Úsalo en un saludo con la clave `userName`. 3. Escribe tu nombre y recarga. 4. Abre DevTools → Application → Local Storage y mira `userName`. |
| 4 | value | «¿Qué texto ves en `userName`? Cópialo tal cual.» Esperado: el nombre **entre comillas** (se acepta cualquier texto que empiece y termine con `"`). ✗ sin comillas → «¿Guardaste con `JSON.stringify`? Sin él, un número o un objeto no vuelven igual.» |
| 5 | choice | **Predice: `useDataApi`.** «La URL cambia de `/users/999` (404) a `/users/1`. Si el efecto **no** hace `setError(null)` al empezar, ¿qué muestra el componente?» Opciones: **Sigue mostrando «Error 404»** ✓ «El error viejo nunca se borra, y el componente revisa el error antes que los datos.» · Muestra a Leanne Graham ✗ «Eso pasa con `setError(null)`.» (los dos medidos) |
| 6 | choice | «Y si no hay red, ¿qué recibe `catch`?» Opciones: **Un error «Failed to fetch»** ✓ «Sin red, `fetch` sí rechaza.» · Nada: `fetch` nunca falla ✗ · Un 404 ✗ «Sin red no hay respuesta, ni siquiera un 404.» (medido en Chrome) |
| 7 | steps | Tarea: «Hook personalizado para obtener datos: recupera datos de una API y gestiona los estados de carga y error.» Pasos: 1. Crea `src/useDataApi.js`. 2. Úsalo con `https://jsonplaceholder.typicode.com/users`. 3. Cambia la URL a `/users/999`. 4. Mira qué muestra tu componente. |
| 8 | value | **Paso 3 · Compara.** «Con `/users/999`, ¿tu componente muestra un error? Escribe sí o no.» Esperado: `sí` (también `si`). ✗ → «Un 404 no hace fallar a `fetch`. Revisa `res.ok` en el primer `then` y lanza el error.» |
| 9 | solution | `useLocalStorage` + saludo, `useDataApi` (lab) con imports. Nota: «Cursor puede marcar “set-state-in-effect” en `setIsLoading(true)`. Es una advertencia de estilo de React; el hook funciona. Hay formas sin ella, más avanzadas.» |
| 10 | takeaway | • **Un hook personalizado es una función `use…` que llama a otros hooks.** • **Cada componente que lo usa tiene su propio estado.** • **`fetch` no falla con un 404: revisa `res.ok`.** |

### 4.8 Check-in (Autoevaluación)

Title: «Autoevaluación: Hooks de React». Intro: «Cinco preguntas, una por video. Cada respuesta se revisa al instante.» One `choice` per item (retry allowed), then a closing screen «Terminaste la lección.» No coach, no score sent anywhere.

| # | Item | Options (✓ first; shuffle on screen) | Feedback |
|---|---|---|---|
| 1 | Un componente tiene `let total = 0;` y un botón que hace `total = total + 1`. ¿Qué muestra después de 2 clics? | ✓ 0 · 2 · 1 | «Una variable normal no redibuja. Para eso existe `useState`.» (medido) |
| 2 | `useEffect(() => { … }, [query])`. ¿Cuándo se ejecuta? | ✓ Al montar y cada vez que `query` cambia · Solo al montar · Después de cada render | «El arreglo lista de qué depende el efecto.» |
| 3 | ¿Cuándo ejecuta React la función que devuelve un efecto? | ✓ Antes de repetir el efecto y al desmontar · Solo cuando hay un error · Nunca, hay que llamarla a mano | «Así se detiene lo que el efecto inició.» (medido) |
| 4 | Haces `countRef.current = 5` dentro de un clic. ¿Qué pasa en pantalla? | ✓ Nada, hasta el próximo render · Muestra 5 al instante · Aparece un error | «Cambiar una ref no redibuja.» (medido) |
| 5 | `fetch('/users/999')` responde 404. ¿Qué hace `fetch`? | ✓ Resuelve normalmente; hay que revisar `res.ok` · Rechaza y entra en `catch` · Devuelve `null` | «`fetch` solo rechaza si falla la red.» (medido) |

## 5. Length (section 4 of the work-order)

| Block | Estimate | How |
|---|---|---|
| F1 useState | ~2:00 (118 s) | planner formula, English rate |
| F2 useEffect: cuándo se ejecuta | ~2:25 (147 s) | same |
| F3 useEffect: limpieza | ~2:10 (129 s) | same |
| F4 useRef | ~2:00 (121 s) | same |
| F5 Hooks personalizados | ~2:25 (144 s) | same |
| **Films total** | **~11.0 min** (659 s) | inside the 10–12 min target; **not measured**, P2 reports real lengths |
| P-1 … P-5 | 10–15 min each (work-order estimate) | **not measured**; P4 times one end to end |
| Check-in | not estimated | 5 choice items, 3 options each |
| **Lesson** | about 1 to 1.5 h | estimate from the two rows above, not a measurement |

## 6. Correctness: what ran, and the SME check

### 6.1 How it was checked
Every snippet in the films and practices, and the risky originals, ran in a throwaway Vite app outside the repo (React 19.3.1, Vite 8.3.6, dev server, `<StrictMode>` on as in the Vite template), driven by headless Chrome. A second round (`round2-tests.mjs`) measured every claim the adversarial review found unmeasured, and the replacement practice questions. Lint: the template's own `npm run lint` (oxlint) and eslint-plugin-react-hooks 7.1.1 `recommended` (`lint-output.txt`). Sources, runner and raw output: `planning/snippet-check/`. The original code was read from frames of the MP4s (downloaded to a temp folder, not committed).

### 6.2 Measured results used in this storyboard

| Snippet | Result |
|---|---|
| `let` counter, 3 clicks | `Pomodoros: 0` |
| `useState` counter, 3 clicks | `Pomodoros: 3` |
| two `setCount(count + 1)` per click, 3 clicks | `3`; with `c => c + 1` twice: `6` |
| fetch with no dependency array | requests never stop (mocked API; count not quoted) |
| fetch with `[]` | name shown; **2 requests** in dev (StrictMode) |
| 3 effects (none / `[]` / `[count]`) | mount: A B C A B C · click: A C · 2 letters: A A |
| timer without cleanup | 0 → 2 → 4 → 6 → 8 per second; `tic` keeps printing after unmount |
| timer `setSeconds(seconds + 1)` with `[]` | 0 → 1 → 1 → 1 → 1 per second |
| timer with `clearInterval` right after `setInterval` | 0 → 0 → 0 → 0 → 0 |
| timer with `[seconds]`, no cleanup | 0 → 2 → 5 → 10 → 19 per second |
| timer with cleanup | 0 → 1 → 2 → 3 → 4; console: iniciado, detenido, iniciado; detenido on unmount; shown again: iniciado, detenido, iniciado |
| fetch with `[]`, API delayed 800 ms | first screen «Cargando...», then the name |
| scroll without cleanup | each scroll logged twice; after unmount, on a page that still scrolls: 3 scrolls → 6 logs |
| scroll with cleanup | once per scroll; nothing after unmount |
| `resize` without / with cleanup | 2 resizes → 4 / 2 logs; 1 resize after unmount → 2 / 0 logs |
| `focus()` via ref | input focused; 0 extra renders |
| previous value with `let` | `antes: undefined` |
| previous value with `useRef` | `Ahora: 3, antes: 2`; after 5 clicks `antes: 4` |
| previous value written during render | after 5 clicks `antes: 5` |
| ref +1 ×3 then state +1 | `estado: 0 \| ref: 0`, then `estado: 1 \| ref: 3` |
| ref +1 ×2 then state +1 ×2 | `estado: 2 \| ref: 2` |
| `useLocalStorage` | survives reload; stored as `"Vale"` (with quotes); "Borrar" stores `""` |
| `useLocalStorage` with `hola` (not JSON) stored | «Hola, invitado»; storage becomes `""` |
| two components, same key, one sets `oscuro` | the other still shows `claro`; storage `"oscuro"` |
| `useDataApi` original, `/users/999` | shows `{}`, `error` null |
| `useDataApi` as narrated (`setIsLoading(false)` after the chain) | "loading" never shows |
| `useDataApi` fixed (`res.ok` + `finally`) | `/users/1` data; `/users/999` → `Error 404`; network down → `Failed to fetch` |
| URL 999 → 1, with / without `setError(null)` | Leanne Graham / still `Error 404` |
| lint, oxlint (template default) | **warnings** on: reading a ref during render (previous value, task 5), `setState` at the top of an effect (`useDataApi`, task 7), and on the deliberate wrong snippets (`let` reassigned after render, missing `seconds` dependency) |
| lint, eslint-plugin-react-hooks 7.1.1 recommended | the same items as **errors** |

### 6.3 SME check (for Dor to forward to the domain lead)

| # | Video | What the original says or shows | What we use | Status |
|---|---|---|---|---|
| S1 | 4, 5, 8 | "Empty dependency array: runs only once after the initial render." | Same rule, plus: in development with StrictMode, mount effects run twice (mount → cleanup → mount); in production once. | Measured. Change in wording. |
| S2 | 4 (slide) | Cleanup example logs "Timer stopped." | In dev, "Timer stopped." prints at mount, before any unmount. We explain it as StrictMode testing the cleanup. | Measured. |
| S3 | 9 | Code uses `setCount(prev => prev + 1)` (correct) but the narration never says why. | F3 says why: `seconds + 1` would stay at 1. | Measured. Addition, not a fix. |
| S4 | 6 | `WindowScroll` renders only an `<h1>`. | On a page that short there is nothing to scroll, so nothing logs. Our version gives the page height. | Measured (page not scrollable). |
| S5 | 12 | `useRef()` with no initial value; reads `ref.current` during render. | `useRef(null)`; same pattern (the task asks for it). **Note for the SME:** the current React docs advise against reading `ref.current` during render and suggest keeping the previous value in state. Keep the classic pattern for this task? | Pattern measured as working; the template's linter warns on it (oxlint `refs`). Question. |
| S6 | 15 | Narration: the clear button "removes the item from local storage". Code: `setName('')`. | The code stores `""`, it does not remove the key. We call the button «Borrar nombre» and do not claim removal. | Measured. Narration fix. |
| S7 | 16 | **Work-order example corrected:** the code on screen already sets `isLoading` to false inside `.finally()`. Only the narration ("Finally, set is loading to false") is ambiguous. | Keep `.finally()`. | Read from the video frame; narrated version measured as broken. |
| S8 | 16 | No `res.ok` check: a 404 is not an error. Initial `isLoading` is `false`, so the first render shows "no data" before "loading". | `if (!res.ok) throw …`, `isLoading` starts `true`, `setError(null)` on each new URL. | Measured. Fix. |
| S9 | 2, 3, 5 | Code is dictated keystroke by keystroke ("open parenthesis…"). | Not carried over (work-order rule). | Style. |
| S10 | 16 | No protection when the URL changes before the previous response arrives (an older response can overwrite a newer one). | Not added (would crowd F5). Ask the SME whether to add an `ignore` flag in the P-5 solution. | Not measured. Question. |
| S11 | 16 | `setIsLoading(true)` (and our `setError(null)`) at the top of the effect. | Kept; the P-5 solution note says the editor may warn. The lint-clean alternative derives `isLoading` from the URL of the last result, which is harder for this level. Keep, or teach the alternative? | Lint measured (warning in oxlint, error in react-hooks 7.1.1). Question. |
| S12 | 4, 9 | StrictMode also re-tests every later mount, not only the first: showing a hidden component prints iniciado, detenido, iniciado again. | P-3 step 4 teaches it. | Measured. Addition. |

## 7. Rise lesson order (for Cowork, after P4)

1. The existing Spanish intro video (kept).
2. "¡COMENZAMOS!"
3. F1 → P-1 embed → Continue
4. F2 → P-2 embed → Continue
5. F3 → P-3 embed → Continue
6. F4 → P-4 embed → Continue
7. F5 → P-5 embed → Continue
8. Check-in embed.

The old lesson stays live until Dor approves the new one.

## 8. What each later phase needs from here

- **P1:** section 3.1 (the `code` beat, `sameCard`, floor 175), the four style questions, the Spanish voice check, one 20-second test film (suggest F3 beat 6 alone: it uses `hl` and `output`).
- **P2:** `films-draft.es.json` → five content files; `_source` says Valeria and Foco are invented; real lengths in the report.
- **P3:** section 4; build P-1 first and stop for the taste gate.
- **P4:** rerun `planning/snippet-check/`; time one practice; embed table.

## 9. Open questions for Dor

| # | Question | My recommendation |
|---|---|---|
| Q1 | The intro video says "try the exercises first, then check yourself with the videos". The planned order is film → practice. | Keep film → practice, and add one Rise text line under the intro: «Mira el video de cada hook y después practica.» |
| Q2 | `wawiwa-activities/CLAUDE.md` says practice films and pages "never reveal answers", but the work-order asks each practice to show a solution after the learner tries, and F3/F4/F5 teach the same pattern the task asks for. | Allow it for self-study: the solution sits behind «Ver solución», only after the learner answered or pressed «Lo construí». The films use different data from the tasks wherever they can (D3). |
| Q3 | S5, S10 and S11 need the SME (S5 and S11 are lint warnings on patterns the course tasks require). | Forward section 6.3 as is. |
