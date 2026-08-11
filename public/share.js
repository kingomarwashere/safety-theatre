// Shareables — renders the stat cards, switches aspect ratio, and exports
// each card as a high-resolution PNG (via html-to-image) or a copy-paste caption.
// Every figure here is drawn from a page on the site; see /sources.
(function () {
  var SITE = 'safetytheatre.theradicalparty.com';
  var TAGS = '#roadsafety #Australia #speedcameras #surveillance #SafetyTheatre';

  // size: '' = big (short numbers), 'mid', 'sm' (long strings)
  var CARDS = [
    { cat: 'The Strategy', num: '+22%', size: '',
      head: 'Road deaths are UP since the plan to <em>halve</em> them.',
      sub: "Australia's National Road Safety Strategy promised to cut deaths in half by 2030. The toll has risen almost every year since.",
      src: 'BITRE, Road Deaths Australia (Dec 2025)', page: 'strategy' },

    { cat: 'The Strategy', num: '2 of 5', size: 'mid',
      head: "Only 2 of the Strategy's 5 key targets can even be measured.",
      sub: "You can't manage what you refuse to count — and governments don't publish the data for the other three.",
      src: 'Nat. Road Safety Strategy 2021–30 / AAA benchmarking', page: 'strategy' },

    { cat: 'Cabin Cameras', num: '11,400', size: '',
      head: 'Seatbelt fines in the first 21 DAYS.',
      sub: 'NSW switched on AI seatbelt cameras with no grace period. About 75% were for wearing a belt "incorrectly" — still the full fine.',
      src: 'Transport for NSW (Aug 2024)', page: 'cameras' },

    { cat: 'Cabin Cameras', num: '380,000', size: '',
      head: "Breaches logged during a 'no-fine' grace period.",
      sub: "WA's new phone & seatbelt cameras quietly counted every offence for 8 months — then switched the revenue on.",
      src: 'WA Government / CarExpert (2024)', page: 'cameras' },

    { cat: 'Cabin Cameras', num: '$1,209', size: '',
      head: 'The highest phone-camera fine in the country.',
      sub: 'One glance in Queensland. The same AI camera photographs your cabin and also scans your seatbelt, your plate and your speed.',
      src: 'Queensland Government (2025)', page: 'cameras' },

    { cat: 'The Money', num: '3,200→27,900', size: 'sm',
      head: 'Monthly fines jumped 9× when the warning signs came off.',
      sub: 'NSW hid its mobile speed cameras in 2020. Low-range fines soared — then fell ~90% the moment the signs returned in 2023.',
      src: 'Revenue NSW / Transport for NSW', page: 'money' },

    { cat: 'The Evidence', num: '15 of 33', size: 'mid',
      head: 'AI camera sites with NO crash record.',
      sub: "Victoria's Auditor-General found police 'cannot show' they checked crash history before siting cameras. If it's about crashes — why here?",
      src: 'Victorian Auditor-General (2026)', page: 'evidence' },

    { cat: 'The Evidence', num: '¼', size: '',
      head: "A quarter of the 'camera effect' is a statistical illusion.",
      sub: 'Regression to the mean: crashes spike randomly, a camera is installed, crashes fall back to normal — and the camera takes the credit.',
      src: 'Peer-reviewed road-safety literature', page: 'evidence' },

    { cat: 'Drug Testing', num: '+836%', size: '',
      head: 'More charges — with no change in behaviour.',
      sub: "NSW's own crime bureau found 'no evidence' drug-driving actually rose. The test detects presence, not impairment — you can be sober and guilty.",
      src: 'BOCSAR (2024)', page: 'drugs' },

    { cat: 'Punishing the Poor', num: '$3,622', size: '',
      head: 'She was jailed over unpaid fines. She died in the cell.',
      sub: 'A flat fine costs a millionaire minutes and a single parent a fortnight. The same "safety" system that fines you can imprison you.',
      src: 'See "Punishing the Poor"', page: 'justice' },

    { cat: 'Speed', num: '2 km/h', size: 'mid',
      head: "The only camera tolerance in Australia you're allowed to know.",
      sub: 'Victoria publishes 2 km/h. Every other state keeps it secret — and legally, any amount over the line is an offence.',
      src: 'Victorian Government / state policies', page: 'speed' },

    { cat: 'Surveillance', num: '16/sec', size: '',
      head: 'Number plates one ANPR unit reads — every second.',
      sub: "Every plate logged, guilty or not, and kept. 'Road safety' cameras have already been repurposed to enforce lockdowns.",
      src: 'See "Surveillance"', page: 'surveillance' }
  ];

  var gallery = document.getElementById('gallery');
  if (!gallery) return;

  function plain(html) { return html.replace(/<[^>]+>/g, ''); }

  function caption(c) {
    return plain(c.head) + ' ' + c.sub +
      '\n\nSource: ' + c.src + '. Full receipts + more visuals: https://' + SITE + '/' + c.page +
      '\n\n' + TAGS;
  }

  CARDS.forEach(function (c, i) {
    var wrap = document.createElement('div');
    wrap.className = 'cardwrap';

    var frame = document.createElement('div');
    frame.className = 'frame';

    var sc = document.createElement('div');
    sc.className = 'sc';
    sc.setAttribute('data-i', i);
    sc.innerHTML =
      '<div class="sc-top"><span class="sc-brand">SAFETY<span>·</span>THEATRE</span>' +
        '<span class="sc-cat">' + c.cat + '</span></div>' +
      '<div class="sc-mid">' +
        '<div class="sc-num ' + c.size + '">' + c.num + '</div>' +
        '<div class="sc-head">' + c.head + '</div>' +
        '<div class="sc-sub">' + c.sub + '</div>' +
      '</div>' +
      '<div class="sc-foot">' +
        '<div class="sc-src"><span>SOURCE — </span>' + c.src + '</div>' +
        '<div class="sc-url">' + SITE + '/<b>' + c.page + '</b></div>' +
      '</div>';
    frame.appendChild(sc);

    var btns = document.createElement('div');
    btns.className = 'cardbtns';
    var dl = document.createElement('button');
    dl.textContent = '↓ PNG';
    dl.addEventListener('click', function () { download(sc, c, dl); });
    var cp = document.createElement('button');
    cp.textContent = 'Copy caption';
    cp.addEventListener('click', function () {
      navigator.clipboard.writeText(caption(c)).then(function () {
        cp.textContent = 'Copied ✓'; cp.classList.add('ok');
        setTimeout(function () { cp.textContent = 'Copy caption'; cp.classList.remove('ok'); }, 1600);
      });
    });
    btns.appendChild(dl); btns.appendChild(cp);

    wrap.appendChild(frame);
    wrap.appendChild(btns);
    gallery.appendChild(wrap);
  });

  var DIMS = { square: [1080, 1080], story: [1080, 1920], wide: [1200, 675] };

  async function download(sc, c, btn) {
    if (!window.htmlToImage) { alert('Export library still loading — try again in a moment, or just screenshot the card.'); return; }
    var fmt = gallery.getAttribute('data-fmt') || 'square';
    var d = DIMS[fmt];
    var prev = sc.style.transform;
    var old = btn.textContent;
    btn.textContent = '…';
    sc.style.transform = 'none';           // capture at full resolution, not the display-scaled size
    try {
      // wait for self-hosted fonts to be ready so they embed into the PNG
      if (document.fonts && document.fonts.ready) { await document.fonts.ready; }
      var url = await window.htmlToImage.toPng(sc, {
        width: d[0], height: d[1], pixelRatio: 1, cacheBust: true, backgroundColor: '#0B0B09'
      });
      var a = document.createElement('a');
      a.href = url;
      a.download = 'safety-theatre-' + c.page + '-' + fmt + '.png';
      a.click();
      btn.textContent = 'Saved ✓'; btn.classList.add('ok');
      setTimeout(function () { btn.textContent = old; btn.classList.remove('ok'); }, 1600);
    } catch (e) {
      btn.textContent = old;
      alert('Could not generate the PNG here — you can still screenshot the card. (' + e + ')');
    } finally {
      sc.style.transform = prev;
    }
  }

  // format switcher
  var sw = document.querySelector('.fmt-switch');
  function setFmt(fmt) {
    if (!DIMS[fmt]) return;
    gallery.setAttribute('data-fmt', fmt);
    if (sw) sw.querySelectorAll('button').forEach(function (x) {
      x.setAttribute('aria-pressed', x.getAttribute('data-fmt') === fmt ? 'true' : 'false');
    });
  }
  if (sw) {
    sw.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      setFmt(b.getAttribute('data-fmt'));
    });
  }
  // allow /share?fmt=story to deep-link a format (shareable preset)
  var q = (location.search.match(/[?&]fmt=(square|story|wide)/) || [])[1];
  if (q) setFmt(q);
})();
