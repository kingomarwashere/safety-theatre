// Shared nav + footer, injected so the 7 pages stay in sync.
// Page content itself lives in each page's HTML (crawlable); only chrome is injected.
(function () {
  const PAGES = [
    { href: '/', label: 'Home', key: 'home' },
    { href: '/strategy', label: 'The Strategy', key: 'strategy' },
    { href: '/money', label: 'The Money', key: 'money' },
    { href: '/speed', label: 'Speed', key: 'speed' },
    { href: '/surveillance', label: 'Surveillance', key: 'surveillance' },
    { href: '/delegations', label: 'Delegations', key: 'delegations' },
    { href: '/sources', label: 'Sources', key: 'sources' },
  ];
  const current = document.body.getAttribute('data-page') || 'home';

  const links = PAGES.map(
    (p) => `<a href="${p.href}"${p.key === current ? ' class="active"' : ''}>${p.label}</a>`
  ).join('');

  const header = document.createElement('header');
  header.className = 'nav';
  header.innerHTML =
    `<a class="brand" href="/">SAFETY<span>&nbsp;</span>THEATRE</a><nav>${links}</nav>`;
  document.body.insertBefore(header, document.body.firstChild);

  const footer = document.createElement('footer');
  footer.innerHTML = `
    <p class="foot-brand">SAFETY<span> </span>THEATRE</p>
    <p>An independent, fact-checkable exposé of revenue-raising and mass surveillance
       dressed up as road safety in Australia.</p>
    <div class="footlinks">
      ${PAGES.filter((p) => p.key !== 'home').map((p) => `<a href="${p.href}">${p.label}</a>`).join('')}
      <a href="https://github.com/kingomarwashere/safety-theatre">Source / corrections</a>
    </div>
    <p class="fine">Public-record analysis and opinion — not legal advice. Every figure is drawn from
       government audits, budget papers, legislation and reputable reporting; see <a href="/sources">Sources</a>.
       Where a number is a government claim, contested, or illustrative, it is labelled as such.
       Verify against the primary source before relying on it. That's the whole point.</p>`;
  document.body.appendChild(footer);
})();
