// "Check your own street" — enter a NSW suburb/postcode (or use location) and see
// the nearest fixed/red-light speed cameras vs the local road-trauma record.
// All client-side, using the same open data behind /map. Fixed + red-light cameras only.
(function () {
  var inp = document.getElementById('q'), sug = document.getElementById('sug'), res = document.getElementById('res');
  if (!inp) return;
  var SUB = [], CAM = [], CR = [];

  Promise.all([
    fetch('/data/nsw-suburbs.json').then(function (r) { return r.json(); }),
    fetch('/data/nsw-cameras.json').then(function (r) { return r.json(); }),
    fetch('/data/nsw-crashes.json').then(function (r) { return r.json(); })
  ]).then(function (a) {
    SUB = a[0];
    CAM = a[1].features.map(function (f) { return { x: f.geometry.coordinates[0], y: f.geometry.coordinates[1], t: f.properties.t, road: f.properties.road, suburb: f.properties.suburb }; });
    CR = a[2].pts;
    inp.disabled = false; inp.placeholder = 'Type a NSW suburb or postcode…';
    inp.addEventListener('input', onInput);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var b = sug.querySelector('.sugbtn'); if (b) b.click(); } });
    var g = document.getElementById('geo'); if (g) g.addEventListener('click', geo);
  });

  function hav(y1, x1, y2, x2) {
    var R = 6371, d = Math.PI / 180, dy = (y2 - y1) * d, dx = (x2 - x1) * d;
    var a = Math.sin(dy / 2) * Math.sin(dy / 2) + Math.cos(y1 * d) * Math.cos(y2 * d) * Math.sin(dx / 2) * Math.sin(dx / 2);
    return 2 * R * Math.asin(Math.sqrt(a));
  }
  function km(d) { return d < 10 ? d.toFixed(1) + ' km' : Math.round(d) + ' km'; }
  function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  function onInput() {
    var q = inp.value.trim().toUpperCase();
    if (q.length < 2) { sug.innerHTML = ''; return; }
    var isPc = /^\d{2,4}$/.test(q), m;
    if (isPc) m = SUB.filter(function (s) { return s.p.indexOf(q) === 0; });
    else { m = SUB.filter(function (s) { return s.n.toUpperCase().indexOf(q) === 0; });
      if (m.length < 3) m = m.concat(SUB.filter(function (s) { return s.n.toUpperCase().indexOf(q) > 0; })); }
    m = m.slice(0, 8);
    sug.innerHTML = m.map(function (s) { return '<button class="sugbtn" data-i="' + SUB.indexOf(s) + '">' + esc(s.n) + ' <span>' + s.p + '</span></button>'; }).join('');
    Array.prototype.forEach.call(sug.querySelectorAll('.sugbtn'), function (b) {
      b.addEventListener('click', function () { var s = SUB[+b.getAttribute('data-i')]; inp.value = s.n; sug.innerHTML = ''; render(s.n, s.p, s.y, s.x); });
    });
  }
  function geo() {
    if (!navigator.geolocation) { alert('Location not available — type a suburb instead.'); return; }
    var g = document.getElementById('geo'); g.textContent = 'Locating…';
    navigator.geolocation.getCurrentPosition(
      function (p) { g.textContent = '📍 Use my location'; inp.value = ''; sug.innerHTML = ''; render('your location', '', p.coords.latitude, p.coords.longitude); },
      function () { g.textContent = '📍 Use my location'; alert('Could not get your location — type a suburb instead.'); }
    );
  }

  function render(name, pc, y, x) {
    var cams = CAM.map(function (c) { return { c: c, d: hav(y, x, c.y, c.x) }; }).sort(function (a, b) { return a.d - b.d; });
    var within = cams.filter(function (o) { return o.d <= 10; });
    var killed = 0, serious = 0, n = 0;
    for (var i = 0; i < CR.length; i++) { var p = CR[i]; if (p[2] < 2020) continue; if (hav(y, x, p[1], p[0]) <= 5) { n++; if (p[3] === 2) killed++; else serious++; } }
    var title = name === 'your location' ? 'Your location' : esc(name) + (pc ? ' <span class="pc">' + pc + '</span>' : '');

    var headline, verdict;
    if (within.length === 0) {
      headline = 'No fixed or red-light cameras within 10 km.';
      verdict = 'The nearest is <b>' + km(cams[0].d) + '</b> away. But within 5 km there were <b>' + killed + '</b> killed and <b>' + serious.toLocaleString() + '</b> seriously injured (2020–2024). This is the road trauma the fixed-camera network doesn\'t watch.';
    } else {
      headline = '<b>' + within.length + '</b> fixed / red-light camera' + (within.length === 1 ? '' : 's') + ' within 10 km.';
      verdict = 'Within 5 km, <b>' + killed + '</b> people were killed and <b>' + serious.toLocaleString() + '</b> seriously injured over five years (' + n.toLocaleString() + ' crashes).';
    }
    var list = cams.slice(0, 5).map(function (o) {
      return '<li><span class="cdot ' + o.c.t + '"></span>' + esc(o.c.road) + ' <em>' + esc(o.c.suburb) + '</em><span class="cd">' + km(o.d) + '</span></li>';
    }).join('');

    res.innerHTML =
      '<div class="res-head"><h2>' + title + '</h2></div>' +
      '<div class="res-grid">' +
        '<div class="res-stat"><div class="rn">' + killed + '</div><div class="rl">killed within 5&nbsp;km<br><span>2020–2024</span></div></div>' +
        '<div class="res-stat"><div class="rn">' + serious.toLocaleString() + '</div><div class="rl">seriously injured within 5&nbsp;km</div></div>' +
        '<div class="res-stat"><div class="rn ' + (within.length ? '' : 'zero') + '">' + within.length + '</div><div class="rl">cameras within 10&nbsp;km<br><span>fixed + red-light</span></div></div>' +
      '</div>' +
      '<p class="res-verdict">' + headline + ' ' + verdict + '</p>' +
      '<div class="res-list"><h4>Nearest cameras</h4><ul>' + list + '</ul></div>' +
      '<p class="res-note">Counts <strong>fixed and red-light</strong> cameras only — the ones NSW publishes locations for. Mobile speed cameras <em>do</em> patrol country roads, but their locations aren\'t released, so they\'re not counted here. Crash data: NSW Road Crash Data 2020–2024 (killed &amp; seriously injured). See <a href="/map">the map</a> · <a href="/sources">sources</a>.</p>';
    res.hidden = false;
    res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
})();
