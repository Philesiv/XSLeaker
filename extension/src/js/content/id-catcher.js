// Module for getting ids from focusable elements:

function getIds() {
  // get ids of all input elements
  const matches = Array.from(document.querySelectorAll('input[id], select[id], textarea[id], button[id]'));
  const ids = matches.map((match) => match.id);
  return ids;
}

export { getIds };
