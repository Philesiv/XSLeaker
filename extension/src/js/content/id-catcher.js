// Module for getting ids from focusable elements:

function getIds(){
  // get ids of all input elements
  let matches = Array.from(document.querySelectorAll("input[id], select[id], textarea[id], button[id]"));
  const ids = matches.map(match => match.id);
  console.log(ids);
  return ids
  //let checker = (arr, target) =>  target.every(value => arr.includes(value));
  //console.log(checker(ids, ["httpStatusCode", "httpStatusCode", "redirect", "test"]))
}


export {getIds}