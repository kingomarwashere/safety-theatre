// Interactive map — NSW crashes (killed & seriously injured) animated by year,
// overlaid with fixed + red-light speed camera locations.
// Data: Transport for NSW open data (CC-BY). Basemap: OpenFreeMap / OpenStreetMap.
(function () {
  if (!window.maplibregl) { return; }
  var YEARS = [2020, 2021, 2022, 2023, 2024];
  var state = { year: 2020, cameras: true, rural: false, playing: false, timer: null };
  var FEATS = [];

  var map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.openfreemap.org/styles/dark',
    center: [147.6, -32.7], zoom: 4.9, minZoom: 4, maxZoom: 16,
    attributionControl: false, dragRotate: false, pitchWithRotate: false
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  map.addControl(new maplibregl.AttributionControl({
    compact: true,
    customAttribution: 'Crash & camera data © Transport for NSW (CC-BY 3.0 AU). Basemap © OpenFreeMap · OpenStreetMap contributors.'
  }), 'bottom-right');

  Promise.all([
    fetch('/data/nsw-crashes.json').then(function (r) { return r.json(); }),
    fetch('/data/nsw-cameras.json').then(function (r) { return r.json(); })
  ]).then(function (res) {
    var cd = res[0], cam = res[1];
    cd.pts.forEach(function (p) {
      if (p[2] >= 2020) {
        FEATS.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [p[0], p[1]] },
          properties: { y: p[2], s: p[3], spd: p[4] } });
      }
    });
    if (map.loaded()) start(cam); else map.on('load', function () { start(cam); });
  });

  function start(cam) {
    map.fitBounds([[140.9, -37.5], [153.7, -28.1]], { padding: 24, duration: 0 });

    map.addSource('crashes', { type: 'geojson', data: { type: 'FeatureCollection', features: FEATS } });
    map.addSource('cameras', { type: 'geojson', data: cam });

    map.addLayer({
      id: 'crash-heat', type: 'heatmap', source: 'crashes',
      paint: {
        'heatmap-weight': ['case', ['==', ['get', 's'], 2], 1, 0.5],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 4, 0.6, 10, 1.7],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 4, 6, 8, 16, 12, 34],
        'heatmap-opacity': 0.85,
        'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(0,0,0,0)', 0.2, '#3b1020', 0.4, '#7a1030', 0.6, '#c31840', 0.8, '#ff2d55', 1, '#ffd0dc']
      }
    });
    map.addLayer({
      id: 'crash-fatal', type: 'circle', source: 'crashes',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 2.2, 10, 5.5],
        'circle-color': '#ff2d55', 'circle-stroke-color': '#0B0B09',
        'circle-stroke-width': 0.5, 'circle-opacity': 0.9
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

    // camera popups
    map.on('click', 'cam', function (e) {
      var p = e.features[0].properties;
      new maplibregl.Popup({ closeButton: false })
        .setLngLat(e.lngLat)
        .setHTML('<strong>' + (p.t === 'red' ? 'Red-light + speed camera' : 'Fixed speed camera') + '</strong><br>' +
          (p.road || '') + '<br>' + (p.suburb || '') + (p.school === 'true' || p.school === true ? ' · school zone' : ''))
        .addTo(map);
    });
    map.on('mouseenter', 'cam', function () { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'cam', function () { map.getCanvas().style.cursor = ''; });

    wire();
    apply();
  }

  function fatalFilter() {
    var f = ['all', ['==', ['get', 'y'], state.year], ['==', ['get', 's'], 2]];
    if (state.rural) f.push(['>=', ['get', 'spd'], 90]);
    return f;
  }
  function heatFilter() {
    var f = ['all', ['==', ['get', 'y'], state.year]];
    if (state.rural) f.push(['>=', ['get', 'spd'], 90]);
    return f;
  }
  function counts() {
    var fa = 0, se = 0;
    for (var i = 0; i < FEATS.length; i++) {
      var pr = FEATS[i].properties;
      if (pr.y !== state.year) continue;
      if (state.rural && pr.spd < 90) continue;
      if (pr.s === 2) fa++; else se++;
    }
    return { f: fa, s: se };
  }
  function apply() {
    if (!map.getLayer('crash-heat')) return;
    map.setFilter('crash-heat', heatFilter());
    map.setFilter('crash-fatal', fatalFilter());
    map.setLayoutProperty('cam', 'visibility', state.cameras ? 'visible' : 'none');
    var c = counts();
    document.getElementById('yearlab').textContent = state.year;
    document.getElementById('yr').value = state.year;
    document.getElementById('readout').innerHTML =
      '<b>' + c.f.toLocaleString() + '</b> killed · <b>' + c.s.toLocaleString() + '</b> seriously injured' +
      (state.rural ? ' · roads ≥90km/h' : '');
  }

  function setYear(y) { state.year = y; apply(); }
  function play() {
    state.playing = true;
    document.getElementById('play').textContent = '❚❚ Pause';
    state.timer = setInterval(function () {
      var i = YEARS.indexOf(state.year);
      setYear(YEARS[(i + 1) % YEARS.length]);
    }, 1400);
  }
  function pause() {
    state.playing = false;
    document.getElementById('play').textContent = '▶ Play';
    clearInterval(state.timer); state.timer = null;
  }
  function wire() {
    document.getElementById('play').addEventListener('click', function () { state.playing ? pause() : play(); });
    document.getElementById('yr').addEventListener('input', function (e) { if (state.playing) pause(); setYear(+e.target.value); });
    document.getElementById('tgCam').addEventListener('change', function (e) { state.cameras = e.target.checked; apply(); });
    document.getElementById('tgRural').addEventListener('change', function (e) { state.rural = e.target.checked; apply(); });
  }
})();
