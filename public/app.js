// Home-page running counter: "raised from camera fines while you read this page".
// Rate is deliberately CONSERVATIVE and labelled illustrative on the page.
// Basis: Victoria alone reported ~$473m in road-safety camera fine revenue in FY2023-24
// (vic.gov.au). Queensland reported ~$464m the same year. A combined national figure
// well over $1bn/yr is defensible; we use a conservative $1,000,000,000/yr here.
(function () {
  const el = document.querySelector('.stat .num[data-target]');
  if (!el) return;
  const PER_SECOND = 1_000_000_000 / (365 * 24 * 60 * 60); // ≈ $31.7/s
  const start = performance.now();
  const fmt = (n) => '$' + Math.floor(n).toLocaleString('en-AU');
  function tick(now) {
    el.textContent = fmt(((now - start) / 1000) * PER_SECOND);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
