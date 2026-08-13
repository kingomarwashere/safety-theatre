// Shared nav + footer, injected so all pages stay in sync.
// Page content itself lives in each page's HTML (crawlable); only chrome is injected.
(function () {
  const PAGES = [
    { href: '/', label: 'Home', key: 'home' },
    { href: '/strategy', label: 'The Strategy', key: 'strategy' },
    { href: '/money', label: 'The Money', key: 'money' },
    { href: '/fund', label: 'The Fund', key: 'fund' },
    { href: '/tolls', label: 'Tolls', key: 'tolls' },
    { href: '/goldmines', label: 'Goldmines', key: 'goldmines' },
    { href: '/map', label: 'The Map', key: 'map' },
    { href: '/evidence', label: 'The Evidence', key: 'evidence' },
    { href: '/speed', label: 'Speed', key: 'speed' },
    { href: '/surveillance', label: 'Surveillance', key: 'surveillance' },
    { href: '/cameras', label: 'Cabin Cameras', key: 'cameras' },
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
    { href: '/share', label: 'Shareables', key: 'share' },
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

  // Site-wide consent / direct-democracy call-to-action (before the footer, every page).
  const cta = document.createElement('section');
  cta.className = 'consent-cta';
  cta.innerHTML = `
    <div class="consent-inner">
      <p class="k">You didn't vote for this</p>
      <h2>None of this was ever put to a vote.</h2>
      <p>The fines, the secret tolerances, the cameras that photograph inside your car, the
         number-plate dragnet, and the "safety" fund that quietly recycles your money back into
         more of it — almost none of it was debated in Parliament, let alone put to the public. It's
         set by <a href="/delegations">regulation and agency policy</a> and waved through. No election
         ever asked you, and you were never asked to consent.</p>
      <p><strong>The Radical Party exists to fix exactly that.</strong> Direct, radical democracy: you
         vote on the <em>policies</em>, not just the politicians — propose them, vote them in, and
         <em>veto</em> the ones done to you without consent. This site is one receipt; the point is to
         change who gets to decide.</p>
      <div class="btnrow">
        <a class="btn" href="https://theradicalparty.com/join">Join the Radical Party →</a>
        <a class="btn ghost" href="https://theradicalparty.com">What is direct democracy?</a>
      </div>
      <p class="whistle"><b>Work inside this system?</b> We work with government whistleblowers. If you
         have documents, data or insight that could help end this — from inside a police force, a
         transport agency, a camera contractor or a minister's office — reach us confidentially at
         <a href="mailto:whistle@theradicalparty.com">whistle@theradicalparty.com</a>. Every figure on
         this site came from the public record; the next one could come from you.</p>
    </div>`;
  document.body.appendChild(cta);

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
