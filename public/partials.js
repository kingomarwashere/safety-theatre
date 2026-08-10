// Shared nav + footer, injected so all pages stay in sync.
// Page content itself lives in each page's HTML (crawlable); only chrome is injected.
(function () {
  const PAGES = [
    { href: '/', label: 'Home', key: 'home' },
    { href: '/strategy', label: 'The Strategy', key: 'strategy' },
    { href: '/money', label: 'The Money', key: 'money' },
    { href: '/tolls', label: 'Tolls', key: 'tolls' },
    { href: '/goldmines', label: 'Goldmines', key: 'goldmines' },
    { href: '/evidence', label: 'The Evidence', key: 'evidence' },
    { href: '/speed', label: 'Speed', key: 'speed' },
    { href: '/surveillance', label: 'Surveillance', key: 'surveillance' },
    { href: '/corruption', label: 'Contracts', key: 'corruption' },
    { href: '/errors', label: 'Errors', key: 'errors' },
    { href: '/justice', label: 'Punishing the Poor', key: 'justice' },
    { href: '/drugs', label: 'Drug Testing', key: 'drugs' },
    { href: '/world', label: 'The World', key: 'world' },
    { href: '/states', label: 'By State', key: 'states' },
    { href: '/rights', label: 'Right to Drive?', key: 'rights' },
    { href: '/act', label: 'Take Action', key: 'act' },
    { href: '/delegations', label: 'The Law', key: 'delegations' },
    { href: '/court', label: 'The Court Trap', key: 'court' },
    { href: '/solutions', label: 'What Works', key: 'solutions' },
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
       government audits, budget papers, legislation, peer-reviewed studies and reputable reporting;
       see <a href="/sources">Sources</a>. Where a number is a government claim, contested, or
       illustrative, it is labelled as such. Verify against the primary source before relying on it.</p>`;
  document.body.appendChild(footer);

  // Radical Party shared cross-subdomain wayfinding footer (so this site isn't a dead end).
  var rf = document.createElement('script');
  rf.src = 'https://theradicalparty.com/footer.js';
  rf.defer = true;
  document.body.appendChild(rf);
})();
