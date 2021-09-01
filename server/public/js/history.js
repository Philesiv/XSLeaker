const modal = document.getElementById('testModal');
modal.addEventListener('show.bs.modal', (event) => {
  const row = event.relatedTarget;
  const rowid = parseInt(row.getAttribute('data-bs-id'));
  const modalbody = modal.getElementsByClassName('modal-body')[0];
  console.log(Number.isNaN(rowid));
  if (Number.isNaN(rowid)) {
    modalbody.innerHTML = 'ID is not valide';
  } else {
    fetch(`/history/get/${rowid}`)
      .then((response) => response.text())
      .then((body) => {
        modalbody.innerHTML = body;
      });
  }
});
