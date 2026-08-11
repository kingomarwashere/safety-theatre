// Self-contained inline-SVG charts (no libraries, no build step).
// Renders into any container present on the page: #chart-fatalities, #chart-nsw-revenue.
(function () {
  var RED = '#FF2D55', INK = '#F7F3EA', MUTED = '#a49e91', LINE = '#2b2822', AMBER = '#ffbe3d';

  // --- DATA (all cited on the page / Sources) ---
  // National road deaths by calendar year — BITRE ARDD (2000–2022) + monthly bulletins (2023–25).
  var FATALITIES = [
    [2000,1817],[2001,1737],[2002,1715],[2003,1621],[2004,1583],[2005,1627],[2006,1598],
    [2007,1603],[2008,1437],[2009,1491],[2010,1353],[2011,1277],[2012,1300],[2013,1186],
    [2014,1150],[2015,1206],[2016,1294],[2017,1223],[2018,1135],[2019,1186],[2020,1097],
    [2021,1130],[2022,1180],[2023,1258],[2024,1292],[2025,1317]
  ];
  // NSW speed + red-light camera fine revenue by financial year ($ millions) — Revenue NSW DSF010.
  var NSW_REVENUE = [
    ['19-20',89.8],['20-21',274.1],['21-22',297.4],['22-23',240.7],
    ['23-24',252.9],['24-25',283.7],['25-26',346.7]
  ];

  function el(tag, attrs, txt) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (txt != null) e.textContent = txt;
    return e;
  }

  function lineChart(host) {
    var W = 820, H = 380, padL = 52, padR = 24, padT = 30, padB = 46;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', role: 'img',
      'aria-label': 'Australian road deaths by year, 2000 to 2025' });
    var xs = FATALITIES.map(function (d) { return d[0]; });
    var minY = 0, maxY = 1900;
    var x0 = xs[0], x1 = xs[xs.length - 1];
    function X(yr) { return padL + (yr - x0) / (x1 - x0) * (W - padL - padR); }
    function Y(v) { return H - padB - (v - minY) / (maxY - minY) * (H - padT - padB); }

    // y gridlines
    [0, 500, 1000, 1500, 1817].forEach(function (v) {
      svg.appendChild(el('line', { x1: padL, y1: Y(v), x2: W - padR, y2: Y(v), stroke: LINE, 'stroke-width': 1 }));
      svg.appendChild(el('text', { x: padL - 8, y: Y(v) + 4, fill: MUTED, 'font-size': 12, 'text-anchor': 'end', 'font-family': 'IBM Plex Mono, monospace' }, v.toLocaleString()));
    });
    // x labels (every 5 yrs)
    xs.forEach(function (yr) {
      if (yr % 5 === 0 || yr === x1) {
        svg.appendChild(el('text', { x: X(yr), y: H - padB + 20, fill: MUTED, 'font-size': 12, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono, monospace' }, "'" + String(yr).slice(2)));
      }
    });
    // 2020 low marker
    svg.appendChild(el('line', { x1: X(2020), y1: padT, x2: X(2020), y2: H - padB, stroke: MUTED, 'stroke-dasharray': '3 4', 'stroke-width': 1 }));
    svg.appendChild(el('text', { x: X(2020) + 4, y: padT + 12, fill: MUTED, 'font-size': 11, 'font-family': 'IBM Plex Mono, monospace' }, '2020 low'));

    // line path
    var d = FATALITIES.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join(' ');
    svg.appendChild(el('path', { d: d, fill: 'none', stroke: RED, 'stroke-width': 2.5 }));
    // points (colour the rise since 2020 red, prior grey-ish)
    FATALITIES.forEach(function (p) {
      svg.appendChild(el('circle', { cx: X(p[0]), cy: Y(p[1]), r: p[0] >= 2020 ? 3.5 : 2.4, fill: p[0] >= 2020 ? RED : INK }));
    });
    host.appendChild(svg);
  }

  function barChart(host) {
    var W = 820, H = 360, padL = 56, padR = 20, padT = 26, padB = 50;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', role: 'img',
      'aria-label': 'NSW speed and red-light camera fine revenue by financial year' });
    var maxY = 400;
    function Y(v) { return H - padB - v / maxY * (H - padT - padB); }
    [0, 100, 200, 300, 400].forEach(function (v) {
      svg.appendChild(el('line', { x1: padL, y1: Y(v), x2: W - padR, y2: Y(v), stroke: LINE, 'stroke-width': 1 }));
      svg.appendChild(el('text', { x: padL - 8, y: Y(v) + 4, fill: MUTED, 'font-size': 12, 'text-anchor': 'end', 'font-family': 'IBM Plex Mono, monospace' }, '$' + v + 'M'));
    });
    var n = NSW_REVENUE.length;
    var band = (W - padL - padR) / n;
    var bw = band * 0.6;
    NSW_REVENUE.forEach(function (d, i) {
      var cx = padL + band * i + band / 2;
      var h = (H - padB) - Y(d[1]);
      svg.appendChild(el('rect', { x: cx - bw / 2, y: Y(d[1]), width: bw, height: h, fill: RED, rx: 2 }));
      svg.appendChild(el('text', { x: cx, y: Y(d[1]) - 6, fill: INK, 'font-size': 11, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono, monospace' }, '$' + Math.round(d[1]) + 'M'));
      svg.appendChild(el('text', { x: cx, y: H - padB + 18, fill: MUTED, 'font-size': 11, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono, monospace' }, d[0]));
    });
    // annotate warning-sign era
    svg.appendChild(el('text', { x: padL, y: padT - 8, fill: AMBER, 'font-size': 11, 'font-family': 'IBM Plex Mono, monospace' }, 'warning signs removed Nov 2020 → restored 2023'));
    host.appendChild(svg);
  }

  // Camera fine revenue as a share of the state POLICE budget (the incentive, visualised).
  function shareChart(host) {
    var rows = [
      { lab: 'Victoria', fines: 473, budget: 4500, pct: '≈10%', tag: 'verified',
        note: 'camera fines $473m (2023-24) vs Victoria Police ~$4.5bn (2024-25)' },
      { lab: 'NSW', fines: 636, budget: 5510, pct: '≈12%', tag: 'reported',
        note: 'camera revenue ~$636m (2023-24) vs NSW Police ~$5.51bn (2024-25)' }
    ];
    var W = 820, rowH = 96, padL = 12, padR = 12, top = 8;
    var H = top + rows.length * rowH + 8;
    var trackW = W - padL - padR;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', role: 'img',
      'aria-label': 'Camera fine revenue as a share of state police budgets' });
    rows.forEach(function (r, i) {
      var y = top + i * rowH;
      svg.appendChild(el('text', { x: padL, y: y + 16, fill: INK, 'font-size': 15, 'font-weight': 600, 'font-family': 'Syne, sans-serif' }, r.lab + ' Police budget'));
      // full track = police budget
      svg.appendChild(el('rect', { x: padL, y: y + 28, width: trackW, height: 34, rx: 4, fill: '#211d18' }));
      // red slice = camera fines
      var fw = Math.max(6, trackW * (r.fines / r.budget));
      svg.appendChild(el('rect', { x: padL, y: y + 28, width: fw, height: 34, rx: 4, fill: RED }));
      // pct label just past the slice
      svg.appendChild(el('text', { x: padL + fw + 12, y: y + 50, fill: INK, 'font-size': 20, 'font-weight': 800, 'font-family': 'Syne, sans-serif' }, r.pct + ' from cameras'));
      svg.appendChild(el('text', { x: padL, y: y + 82, fill: MUTED, 'font-size': 12.5, 'font-family': 'IBM Plex Mono, monospace' }, r.note + '  [' + r.tag + ']'));
    });
    host.appendChild(svg);
  }

  // NSW "Fines" revenue line, forward estimates — budgeted to climb, never to fall.
  function forecastChart(host) {
    var DATA = [['23-24', 713, 'actual'], ['24-25', 779, ''], ['25-26', 781, 'budget'],
                ['26-27', 772, ''], ['27-28', 791, ''], ['28-29', 793, '']];
    var W = 820, H = 320, padL = 54, padR = 20, padT = 30, padB = 46, maxY = 900;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', role: 'img',
      'aria-label': 'NSW forecast fines revenue 2023-24 to 2028-29' });
    function Y(v) { return H - padB - v / maxY * (H - padT - padB); }
    [0, 300, 600, 900].forEach(function (v) {
      svg.appendChild(el('line', { x1: padL, y1: Y(v), x2: W - padR, y2: Y(v), stroke: LINE, 'stroke-width': 1 }));
      svg.appendChild(el('text', { x: padL - 8, y: Y(v) + 4, fill: MUTED, 'font-size': 12, 'text-anchor': 'end', 'font-family': 'IBM Plex Mono, monospace' }, '$' + v + 'm'));
    });
    var band = (W - padL - padR) / DATA.length, bw = band * 0.56;
    DATA.forEach(function (d, i) {
      var cx = padL + band * i + band / 2, h = (H - padB) - Y(d[1]);
      svg.appendChild(el('rect', { x: cx - bw / 2, y: Y(d[1]), width: bw, height: h, fill: RED, rx: 2, opacity: d[2] === 'actual' ? 1 : 0.82 }));
      svg.appendChild(el('text', { x: cx, y: Y(d[1]) - 7, fill: INK, 'font-size': 12, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono, monospace' }, '$' + d[1] + 'm'));
      svg.appendChild(el('text', { x: cx, y: H - padB + 18, fill: MUTED, 'font-size': 11.5, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono, monospace' }, "'" + d[0]));
      if (d[2]) svg.appendChild(el('text', { x: cx, y: H - padB + 33, fill: MUTED, 'font-size': 10, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono, monospace' }, d[2]));
    });
    svg.appendChild(el('text', { x: padL, y: padT - 12, fill: AMBER, 'font-size': 11, 'font-family': 'IBM Plex Mono, monospace' }, 'forward estimates never forecast fines to fall'));
    host.appendChild(svg);
  }

  var f = document.getElementById('chart-fatalities');
  if (f) lineChart(f);
  var r = document.getElementById('chart-nsw-revenue');
  if (r) barChart(r);
  var s = document.getElementById('chart-fines-share');
  if (s) shareChart(s);
  var fc = document.getElementById('chart-fines-forecast');
  if (fc) forecastChart(fc);
})();
