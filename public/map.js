// Interactive map — crashes animated by year, overlaid with speed-camera locations.
// NSW: killed + seriously injured (2020-24) + fixed/red-light cameras.
// QLD: fatal crashes (2001-25) — Queensland doesn't publish camera coordinates.
// Data: Transport for NSW & Queensland Government open data (CC-BY). Basemap: OpenFreeMap.
(function () {
  if (!window.maplibregl) { return; }

  var STATES = {
    nsw: { crashes: '/data/nsw-crashes.json', cameras: '/data/nsw-cameras.json',
      from: 2020, bounds: [[140.9, -37.5], [153.7, -28.1]], serious: true,
      title: 'NSW — killed &amp; seriously injured, by year of crash' },
    qld: { crashes: '/data/qld-crashes.json', cameras: null,
      from: 2001, bounds: [[137.9, -29.2], [153.6, -9.6]], serious: false,
      title: 'QLD — people killed (fatal crashes), by year' }
  };
  var cache = {};
  var st = { key: 'nsw', year: null, years: [], feats: [], cameras: true, rural: false, playing: false, timer: null, hasCam: true };

  var map = new maplibregl.Map({
    container: 'map', style: 'https://tiles.openfreemap.org/styles/dark',
    center: [147.6, -32.7], zoom: 4.6, minZoom: 3.5, maxZoom: 16,
    attributionControl: false, dragRotate: false, pitchWithRotate: false, preserveDrawingBuffer: true
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  map.addControl(new maplibregl.AttributionControl({ compact: true,
    customAttribution: 'Crash & camera data © Transport for NSW & Queensland Government (CC-BY). Basemap © OpenFreeMap · OpenStreetMap contributors.' }), 'bottom-right');

  function getJSON(url) {
    return cache[url] ? Promise.resolve(cache[url]) : fetch(url).then(function (r) { return r.json(); }).then(function (d) { cache[url] = d; return d; });
  }

  map.on('load', function () {
    map.addSource('crashes', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    map.addSource('cameras', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    map.addLayer({
      id: 'crash-heat', type: 'heatmap', source: 'crashes',
      paint: {
        'heatmap-weight': ['case', ['==', ['get', 's'], 2], 1, 0.5],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 3.5, 0.5, 10, 1.7],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 3.5, 5, 8, 16, 12, 34],
        'heatmap-opacity': 0.85,
        'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(0,0,0,0)', 0.2, '#3b1020', 0.4, '#7a1030', 0.6, '#c31840', 0.8, '#ff2d55', 1, '#ffd0dc']
      }
    });
    map.addLayer({
      id: 'crash-fatal', type: 'circle', source: 'crashes',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 1.8, 10, 5.5],
        'circle-color': '#ff2d55', 'circle-stroke-color': '#0B0B09', 'circle-stroke-width': 0.5, 'circle-opacity': 0.9
      }
    });
    map.addLayer({
      id: 'cam', type: 'circle', source: 'cameras',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 3, 10, 6.5],
        'circle-color': ['match', ['get', 't'], 'red', '#4fe39a', '#ffbe3d'],
        'circle-stroke-color': '#0B0B09', 'circle-stroke-width': 1, 'circle-opacity': 0.95
      }
    });
    map.on('click', 'cam', function (e) {
      var p = e.features[0].properties;
      new maplibregl.Popup({ closeButton: false }).setLngLat(e.lngLat)
        .setHTML('<strong>' + (p.t === 'red' ? 'Red-light + speed camera' : 'Fixed speed camera') + '</strong><br>' +
          (p.road || '') + '<br>' + (p.suburb || '') + (p.school === 'true' || p.school === true ? ' · school zone' : '')).addTo(map);
    });
    map.on('mouseenter', 'cam', function () { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'cam', function () { map.getCanvas().style.cursor = ''; });
    wire();
    loadState('nsw');
  });

  function loadState(key) {
    if (st.playing) pause();
    var cfg = STATES[key];
    Promise.all([getJSON(cfg.crashes), cfg.cameras ? getJSON(cfg.cameras) : Promise.resolve({ type: 'FeatureCollection', features: [] })])
      .then(function (res) {
        var cd = res[0], cam = res[1];
        st.key = key; st.hasCam = !!cfg.cameras;
        st.years = cd.years.filter(function (y) { return y >= cfg.from; });
        st.feats = [];
        cd.pts.forEach(function (p) {
          if (p[2] >= cfg.from) st.feats.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [p[0], p[1]] }, properties: { y: p[2], s: p[3], spd: p[4] } });
        });
        map.getSource('crashes').setData({ type: 'FeatureCollection', features: st.feats });
        map.getSource('cameras').setData(cam);
        st.year = st.years[0];
        var yr = document.getElementById('yr');
        yr.min = st.years[0]; yr.max = st.years[st.years.length - 1]; yr.value = st.year;
        var tc = document.getElementById('tgCam');
        tc.disabled = !st.hasCam; tc.closest('label').style.opacity = st.hasCam ? 1 : 0.35;
        document.querySelector('.maptitle').innerHTML = cfg.title;
        document.querySelectorAll('.leg-cam').forEach(function (el) { el.style.display = st.hasCam ? 'flex' : 'none'; });
        document.querySelectorAll('.stbtn').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-st') === key ? 'true' : 'false'); });
        map.fitBounds(cfg.bounds, { padding: 24, duration: 0 });
        apply();
      });
  }

  function heatFilter() { var f = ['all', ['==', ['get', 'y'], st.year]]; if (st.rural) f.push(['>=', ['get', 'spd'], 90]); return f; }
  function fatalFilter() { var f = ['all', ['==', ['get', 'y'], st.year], ['==', ['get', 's'], 2]]; if (st.rural) f.push(['>=', ['get', 'spd'], 90]); return f; }
  function counts() {
    var fa = 0, se = 0;
    for (var i = 0; i < st.feats.length; i++) {
      var pr = st.feats[i].properties;
      if (pr.y !== st.year) continue;
      if (st.rural && pr.spd < 90) continue;
      if (pr.s === 2) fa++; else se++;
    }
    return { f: fa, s: se };
  }
  function apply() {
    if (!map.getLayer('crash-heat')) return;
    map.setFilter('crash-heat', heatFilter());
    map.setFilter('crash-fatal', fatalFilter());
    map.setLayoutProperty('cam', 'visibility', (st.hasCam && st.cameras) ? 'visible' : 'none');
    var c = counts();
    document.getElementById('yearlab').textContent = st.year;
    document.getElementById('yr').value = st.year;
    var serious = STATES[st.key].serious ? ' · <b>' + c.s.toLocaleString() + '</b> seriously injured' : '';
    document.getElementById('readout').innerHTML = '<b>' + c.f.toLocaleString() + '</b> killed' + serious + (st.rural ? ' · roads ≥90km/h' : '');
  }

  function setYear(y) { st.year = y; apply(); }
  function play() {
    st.playing = true; document.getElementById('play').textContent = '❚❚ Pause';
    var ms = st.years.length > 10 ? 750 : 1400;
    st.timer = setInterval(function () { var i = st.years.indexOf(st.year); setYear(st.years[(i + 1) % st.years.length]); }, ms);
  }
  function pause() { st.playing = false; document.getElementById('play').textContent = '▶ Play'; clearInterval(st.timer); st.timer = null; }

  async function snapshot() {
    var mc = map.getCanvas(), W = mc.width, H = mc.height, s = W / 1200;
    var top = Math.round(150 * s), bot = Math.round(92 * s);
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H + top + bot;
    var g = cv.getContext('2d');
    g.fillStyle = '#0B0B09'; g.fillRect(0, 0, cv.width, cv.height);
    try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) { }
    var x = Math.round(42 * s);
    g.textBaseline = 'alphabetic';
    // brand
    g.font = '800 ' + Math.round(34 * s) + "px Syne, sans-serif";
    g.fillStyle = '#F7F3EA'; g.fillText('SAFETY', x, Math.round(52 * s));
    var w1 = g.measureText('SAFETY ').width;
    g.fillStyle = '#FF2D55'; g.fillText('·', x + w1, Math.round(52 * s));
    g.fillStyle = '#F7F3EA'; g.fillText(' THEATRE', x + w1 + g.measureText('· ').width - Math.round(6 * s), Math.round(52 * s));
    // title + year
    g.font = '500 ' + Math.round(21 * s) + "px 'IBM Plex Mono', monospace";
    g.fillStyle = '#a49e91';
    var lab = (st.key === 'nsw' ? 'NSW · killed & seriously injured' : 'QLD · people killed') + '  —  ' + st.year;
    g.fillText(lab.toUpperCase(), x, Math.round(96 * s));
    g.fillStyle = '#ff2d55'; g.fillText('WHERE THE CAMERAS ARE. WHERE YOU DIE.', x, Math.round(126 * s));
    // map
    g.drawImage(mc, 0, top, W, H);
    // footer
    g.font = '500 ' + Math.round(22 * s) + "px 'IBM Plex Mono', monospace";
    g.fillStyle = '#ff2d55'; g.fillText('safetytheatre.theradicalparty.com/map', x, H + top + Math.round(56 * s));
    g.fillStyle = '#6c665b'; g.font = '400 ' + Math.round(16 * s) + "px 'IBM Plex Mono', monospace";
    var src = 'Source: TfNSW / QLD Gov open data (CC-BY) · basemap © OpenFreeMap · OpenStreetMap';
    g.fillText(src, x, H + top + Math.round(80 * s));
    var a = document.createElement('a');
    a.href = cv.toDataURL('image/png');
    a.download = 'safety-theatre-map-' + st.key + '-' + st.year + '.png';
    a.click();
  }

  function wire() {
    document.getElementById('play').addEventListener('click', function () { st.playing ? pause() : play(); });
    document.getElementById('yr').addEventListener('input', function (e) { if (st.playing) pause(); setYear(+e.target.value); });
    document.getElementById('tgCam').addEventListener('change', function (e) { st.cameras = e.target.checked; apply(); });
    document.getElementById('tgRural').addEventListener('change', function (e) { st.rural = e.target.checked; apply(); });
    document.getElementById('snap').addEventListener('click', snapshot);
    document.querySelectorAll('.stbtn').forEach(function (b) {
      b.addEventListener('click', function () { if (b.getAttribute('data-st') !== st.key) loadState(b.getAttribute('data-st')); });
    });
  }
})();
