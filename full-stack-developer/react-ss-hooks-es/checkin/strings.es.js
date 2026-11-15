/* React Hooks self-study, check-in (Autoevaluación): every learner-facing string and the data of this page.
   To translate: copy to strings.<lang>.js, translate the values only, keep the keys,
   then run `node shared/build.mjs checkin <lang>`.
   Text between backticks is code and is never translated. **Text** between two asterisks is bold.
   Source: planning/STORYBOARD.md, section 4.8. Five questions, one per film; each answer is checked
   at once and can be tried again. No coach, and no score is sent anywhere. */
window.RH_PAGE = {
  docTitle: "Autoevaluación: Hooks de React",
  name: "Autoevaluación: Hooks de React",
  lead: "Cinco preguntas, una por video. Cada respuesta se revisa al instante.",
  /* A check-in: no step pills in the header, and the questions are numbered ("Pregunta 2 de 5") */
  checkin: true,
  /* The options are listed here with the right one first and are shown in a new order on every visit */
  shuffle: true,
  screens: [
    {
      id: "p1",
      type: "choice",
      question: "Un componente tiene `let total = 0;` y un botón que hace `total = total + 1`. ¿Qué muestra después de 2 clics?",
      options: [
        { text: "0", correct: true, why: "Una variable normal no redibuja. Para eso existe `useState`." },
        { text: "2" },
        { text: "1" }
      ]
    },
    {
      id: "p2",
      type: "choice",
      question: "`useEffect(() => { … }, [query])`. ¿Cuándo se ejecuta?",
      options: [
        { text: "Al montar y cada vez que `query` cambia", correct: true, why: "El arreglo lista de qué depende el efecto." },
        { text: "Solo al montar" },
        { text: "Después de cada render" }
      ]
    },
    {
      id: "p3",
      type: "choice",
      question: "¿Cuándo ejecuta React la función que devuelve un efecto?",
      options: [
        { text: "Antes de repetir el efecto y al desmontar", correct: true, why: "Así se detiene lo que el efecto inició." },
        { text: "Solo cuando hay un error" },
        { text: "Nunca, hay que llamarla a mano" }
      ]
    },
    {
      id: "p4",
      type: "choice",
      question: "Haces `countRef.current = 5` dentro de un clic. ¿Qué pasa en pantalla?",
      options: [
        { text: "Nada, hasta el próximo render", correct: true, why: "Cambiar una ref no redibuja." },
        { text: "Muestra 5 al instante" },
        { text: "Aparece un error" }
      ]
    },
    {
      id: "p5",
      type: "choice",
      question: "`fetch('/users/999')` responde 404. ¿Qué hace `fetch`?",
      options: [
        { text: "Resuelve normalmente; hay que revisar `res.ok`", correct: true, why: "`fetch` solo rechaza si falla la red." },
        { text: "Rechaza y entra en `catch`" },
        { text: "Devuelve `null`" }
      ]
    },
    {
      id: "fin",
      type: "takeaway",
      title: "Terminaste la lección."
    }
  ]
};
