document.addEventListener('DOMContentLoaded', () => {
  const els = document.querySelectorAll('.countdown');
  function updateAll() {
    const now = new Date();
    els.forEach(el => {
      const target = new Date(el.dataset.datetime);
      const diff   = target - now;
      if (diff <= 0) {
        el.textContent = 'Event started';
      } else {
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        el.textContent = `${hrs}h ${mins}m ${secs}s`;
      }
    });
  }
  updateAll();
  setInterval(updateAll, 1000);
}); 