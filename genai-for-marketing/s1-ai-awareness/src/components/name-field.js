// Optional first-name field (original: screen 2, "Type your first name"). Saved only in this
// browser via the name store; empty is fine — greetings then drop the name.
export function nameField(ctx, { x, y, w, h: hh, placeholder, fontSize = 24 }) {
  const input = ctx.h('input', {
    class: 'name-field', type: 'text', autocomplete: 'given-name', maxlength: '40',
    placeholder, 'aria-label': placeholder,
    style: `left:${x}px;top:${y}px;width:${w}px;height:${hh}px;font-size:${fontSize}px;`,
  });
  input.value = ctx.name.get();
  const save = () => { ctx.name.set(input.value); };
  input.addEventListener('change', save);
  input.addEventListener('blur', save);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { save(); input.blur(); } e.stopPropagation(); });
  return input;
}
