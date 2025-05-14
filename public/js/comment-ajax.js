document.addEventListener('DOMContentLoaded', () => {
  const form  = document.getElementById('comment-form');
  const errEl = document.getElementById('comment-error');
  const list  = document.querySelector('.comments-list');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errEl.style.display = 'none';

    const { name, comment } = Object.fromEntries(new FormData(form));
    if (!name.trim() || !comment.trim()) {
      errEl.textContent = 'Both fields are required.';
      return errEl.style.display = '';
    }

    try {
      const resp = await fetch(`${window.location.pathname}/comments`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body:    JSON.stringify({ name, comment })
      });
      let data;
      try { data = await resp.json(); }
      catch { throw new Error(await resp.text() || 'Unexpected server error'); }

      if (!resp.ok) throw new Error(data.error);

      const li = document.createElement('li');
      li.className = 'mb-3 p-2 border rounded';
      li.append(
        document.createTextNode(`${data.name} (${data.timestamp}): ${data.comment}`)
      );
      list.prepend(li);

      form.reset();
    } catch (err) {
      errEl.textContent = err.message;
      errEl.style.display = '';
    }
  });
}); 