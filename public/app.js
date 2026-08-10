// Running "fines raised while you read" counter.
// Illustrative rate derived from publicly reported annual camera fine revenue.
// Assumption is intentionally conservative and clearly labelled on the page.
(function () {
  const el = document.querySelector('.stat .num[data-target]');
  if (!el) return;

  // ~ $400,000,000 / year in camera fine revenue (order-of-magnitude, illustrative)
  // -> dollars per second
  const PER_SECOND = 400_000_000 / (365 * 24 * 60 * 60); // ≈ $12.68/s
  const start = performance.now();

  const fmt = (n) =>
    '$' + Math.floor(n).toLocaleString('en-AU');

  function tick(now) {
    const elapsed = (now - start) / 1000;
    el.textContent = fmt(elapsed * PER_SECOND);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

// Label ledger rows for mobile stacked view
document.querySelectorAll('.ledger .row:not(.head)').forEach((row) => {
  const label = row.querySelector('span')?.textContent || '';
  row.querySelectorAll('span').forEach((s, i) => {
    if (i > 0) s.setAttribute('data-l', label);
  });
});
