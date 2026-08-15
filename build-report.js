// Assembles public/report.html — a single, print-optimised compilation of the
// whole exposé, pulled from each page's <section class="phead"> + <main>.
// Run: node build-report.js   (then generate the PDF via headless Chromium)
const fs = require('fs');
const path = require('path');
const PUB = path.join(__dirname, 'public');

// Report order (argument first, then appendices). Interactive pages (map, share) excluded.
const SECTIONS = [
  ['strategy', '01', 'The Strategy'],
  ['money', '02', 'The Money'],
  ['fund', '03', 'The Fund'],
  ['tolls', '04', 'The Toll Scam'],
  ['goldmines', '05', 'The Goldmines'],
  ['evidence', '06', 'The Evidence'],
  ['speed', '07', 'Speed'],
  ['surveillance', '08', 'Surveillance'],
  ['cameras', '09', 'Cabin Cameras'],
  ['corruption', '10', 'Contracts & Corruption'],
  ['errors', '11', 'Faults & Errors'],
  ['justice', '12', 'Punishing the Poor'],
  ['drugs', '13', 'Drug Testing'],
  ['world', '14', 'The World Fights Back'],
  ['states', '15', 'By State'],
  ['rights', '16', 'Right to Drive?'],
  ['delegations', '17', 'The Law'],
  ['court', '18', 'The Court Trap'],
  ['solutions', '19', 'What Actually Works'],
  ['act', 'A', 'Appendix A — Take Action (FOI/GIPA templates)'],
  ['sources', 'B', 'Appendix B — Sources'],
];

function grab(html, re) { const m = html.match(re); return m ? m[1] : ''; }
function clean(frag) {
  return frag
    .replace(/<div[^>]*class="chartbox"[^>]*><\/div>/g, '<p class="print-note">[interactive chart — see the live site]</p>')
    .replace(/<button[\s\S]*?<\/button>/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '');
}

let sectionsHtml = '';
let toc = '';
for (const [file, num, label] of SECTIONS) {
  const html = fs.readFileSync(path.join(PUB, file + '.html'), 'utf8');
  const phead = clean(grab(html, /<section class="phead">([\s\S]*?)<\/section>/));
  const main = clean(grab(html, /<main>([\s\S]*?)<\/main>/));
  toc += `<li><span class="tnum">${num}</span><a href="#s-${file}">${label}</a></li>`;
  sectionsHtml += `<section class="rsec" id="s-${file}">
    <div class="rsec-tag">${num} · Safety Theatre</div>
    <section class="phead">${phead}</section>
    <main>${main}</main>
  </section>`;
}

const out = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Safety Theatre — the full report (printable)</title>
<meta name="description" content="The complete Safety Theatre exposé as a single printable report: how Australian 'road safety' became a revenue and surveillance machine — with every figure sourced." />
<meta name="theme-color" content="#0B0B09" />
<meta property="og:image" content="https://safetytheatre.theradicalparty.com/img/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://safetytheatre.theradicalparty.com/img/og.png" />
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/style.css" />
<link rel="stylesheet" href="/report.css" />
</head>
<body data-page="report" class="report">

<div class="report-actions">
  <a class="btn" href="/safety-theatre-report.pdf" download>↓ Download PDF</a>
  <button class="btn ghost" onclick="window.print()">Print this page</button>
  <a class="btn ghost" href="/">← Back to the site</a>
</div>

<section class="cover">
  <p class="cover-kicker">An independent, fact-checkable exposé · Australia</p>
  <h1 class="cover-title">SAFETY<span>·</span>THEATRE</h1>
  <p class="cover-sub">How Australian "road safety" became a revenue and surveillance machine — and what the government's own audits, budget papers, crash data and legislation actually show.</p>
  <p class="cover-meta">safetytheatre.theradicalparty.com · The Radical Party</p>
  <p class="cover-note">Every figure is drawn from government audits, budget papers, legislation, peer-reviewed studies and reputable reporting, and is labelled <b>verified</b>, <b>reported</b> or <b>contested</b>. Verify against the primary source before relying on it — that is the whole point.</p>
</section>

<section class="toc">
  <h2>Contents</h2>
  <ol class="toclist">${toc}</ol>
</section>

${sectionsHtml}

<section class="rsec closing">
  <h2>You didn't vote for any of this.</h2>
  <p>Almost none of it — the fines, the tolerances, the cameras that photograph inside your car, the fund that recycles your money into more of it — was debated in Parliament, let alone put to the public. The Radical Party exists to change who decides: direct democracy, where you vote on the policies, not just the politicians. Join at <b>theradicalparty.com/join</b>.</p>
  <p>Work inside this system? We work with government whistleblowers — <b>whistle@theradicalparty.com</b>.</p>
</section>

</body>
</html>`;

fs.writeFileSync(path.join(PUB, 'report.html'), out);
console.log('wrote public/report.html (' + (out.length / 1024).toFixed(0) + ' KB), ' + SECTIONS.length + ' sections');
