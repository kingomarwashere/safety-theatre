// Shareables — renders the stat cards, switches aspect ratio, and exports
// each card as a high-resolution PNG (via html-to-image) or a copy-paste caption.
// Every figure here is drawn from a page on the site; see /sources.
(function () {
  var SITE = 'safetytheatre.theradicalparty.com';
  var TAGS = '#roadsafety #Australia #speedcameras #surveillance #SafetyTheatre';

  // Bold, scroll-stopping stat cards. size: '' = big (short numbers), 'mid', 'sm' (long strings).
  // hook = punchy overline; icon = background watermark (see ICONS).
  var CARDS = [
    { cat: 'The Strategy', icon: 'trend', hook: 'Safety first?', num: '+22%', size: '',
      head: 'The toll went <em>up</em> after they vowed to halve it.',
      sub: 'Australia promised to cut road deaths in half by 2030. They’ve risen almost every year since.',
      src: 'BITRE, Road Deaths Australia (Dec 2025)', page: 'strategy' },

    { cat: 'The Strategy', icon: 'target', hook: 'Trust us', num: '2 of 5', size: 'mid',
      head: "They can’t even measure their own targets.",
      sub: "Only 2 of the road-safety strategy’s 5 key targets can be tracked. For the rest, no data is published.",
      src: 'Nat. Road Safety Strategy / AAA benchmarking', page: 'strategy' },

    { cat: 'Cabin Cameras', icon: 'camera', hook: 'Switched on', num: '11,400', size: '',
      head: 'Seatbelt fines in 21 days — zero warning.',
      sub: 'NSW flipped on AI seatbelt cameras with no grace period. ~75% were for wearing a belt “wrong.”',
      src: 'Transport for NSW (Aug 2024)', page: 'cameras' },

    { cat: 'Cabin Cameras', icon: 'camera', hook: "‘Just a warning’", num: '380,000', size: '',
      head: "Caught during the ‘no-fine’ grace period.",
      sub: "WA’s cameras quietly logged every offence for 8 months — then switched the revenue on.",
      src: 'WA Government / CarExpert (2024)', page: 'cameras' },

    { cat: 'Cabin Cameras', icon: 'camera', hook: 'Look down once', num: '$1,209', size: '',
      head: 'The price of a single glance at your phone.',
      sub: 'Queensland’s fine is the country’s harshest — and the same AI also scans your belt, plate and speed.',
      src: 'Queensland Government (2025)', page: 'cameras' },

    { cat: 'The Money', icon: 'eye', hook: 'Surprise', num: '3,200→27,900', size: 'sm',
      head: 'Hide the camera, and fines jump 9×.',
      sub: 'NSW pulled the warning signs in 2020. Fines soared — then fell ~90% the moment they came back.',
      src: 'Revenue NSW / Transport for NSW', page: 'money' },

    { cat: 'The Fund', icon: 'cycle', hook: 'Follow the money', num: '~10%', size: '',
      head: 'A tenth of the police budget — from cameras.',
      sub: "Victoria’s cameras raised $473m in a year: about a tenth of what it costs to run the whole force.",
      src: 'Victorian Govt / Victoria Police AR 2024-25', page: 'fund' },

    { cat: 'The Fund', icon: 'cycle', hook: 'The loop', num: '$118m', size: '',
      head: 'Your fines buy the cameras that fine you.',
      sub: "In one year NSW’s ‘road safety’ fund spent $118.4m running the cameras — plus $36.7m on police.",
      src: 'Transport for NSW Progress Report 2024', page: 'fund' },

    { cat: 'The Fund', icon: 'dollar', hook: 'For safety?', num: '$104m', size: '',
      head: "‘Safety’ cash collected — then not spent.",
      sub: "The NSW Auditor-General found the fund underspent ~$104m in a year; $73m went to no region at all.",
      src: 'NSW Auditor-General (2023)', page: 'fund' },

    { cat: 'The Evidence', icon: 'pin', hook: "‘Where the crashes are’", num: '15 of 33', size: 'mid',
      head: 'AI cameras where there were NO crashes.',
      sub: "Victoria’s auditor found police ‘cannot show’ they checked crash history before siting cameras.",
      src: 'Victorian Auditor-General (2026)', page: 'evidence' },

    { cat: 'The Evidence', icon: 'percent', hook: 'The magic trick', num: '¼', size: '',
      head: "A quarter of the ‘camera effect’ is a mirage.",
      sub: 'Crashes spike at random, a camera arrives, they fall back to normal — and the camera takes the credit.',
      src: 'Peer-reviewed road-safety literature', page: 'evidence' },

    { cat: 'Drug Testing', icon: 'flask', hook: 'Sober. Still guilty.', num: '+836%', size: '',
      head: 'Unimpaired — and charged anyway.',
      sub: "NSW’s own bureau found ‘no evidence’ drug-driving rose. The test finds presence, not impairment.",
      src: 'BOCSAR (2024)', page: 'drugs' },

    { cat: 'Punishing the Poor', icon: 'scales', hook: 'The real cost', num: '$3,622', size: '',
      head: 'Jailed over fines. She died in the cell.',
      sub: 'A flat fine is pocket change to the rich and a fortnight’s rent to the poor. Then it can jail you.',
      src: 'See “Punishing the Poor”', page: 'justice' },

    { cat: 'Speed', icon: 'gauge', hook: "It’s a secret", num: '2 km/h', size: 'mid',
      head: "The only tolerance you’re allowed to know.",
      sub: 'Victoria publishes 2 km/h. Every other state hides it — and any amount over the line is an offence.',
      src: 'Victorian Government / state policies', page: 'speed' },

    { cat: 'Surveillance', icon: 'eye', hook: 'Smile', num: '16/sec', size: '',
      head: 'Every plate. Logged. Guilty or not.',
      sub: "One ANPR unit reads 16 plates a second — all kept. ‘Safety’ cameras already enforced lockdowns.",
      src: 'See “Surveillance”', page: 'surveillance' }
  ];

  // Bold line-icons used as a faint background watermark on each card.
  var ICONS = {
    trend:  '<path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.6"/>',
    camera: '<path d="M3 8h3l2-2.5h8L18 8h3v11H3z"/><circle cx="12" cy="13" r="3.6"/>',
    eye:    '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    dollar: '<line x1="12" y1="2" x2="12" y2="22"/><path d="M17 6.2c0-2-2.2-3-5-3s-5 1-5 3.5S9 10 12 10.5s5 1 5 3.6-2.2 3.5-5 3.5-5-1-5-3.1"/>',
    cycle:  '<path d="M4.5 12a7.5 7.5 0 0 1 12.5-5.6"/><path d="M14 5.5h3.5V9"/><path d="M19.5 12a7.5 7.5 0 0 1-12.5 5.6"/><path d="M10 18.5H6.5V15"/>',
    gauge:  '<path d="M3 16a9 9 0 0 1 18 0"/><line x1="12" y1="16" x2="16.5" y2="10.5"/><circle cx="12" cy="16" r="1.6"/>',
    scales: '<line x1="12" y1="3" x2="12" y2="21"/><path d="M6 21h12"/><path d="M12 6l-7 2 3 5a3 3 0 0 1-6 0l3-5"/><path d="M12 6l7 2-3 5a3 3 0 0 0 6 0l-3-5"/>',
    flask:  '<path d="M9 3h6"/><path d="M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/>',
    pin:    '<path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.6"/>',
    percent:'<line x1="5" y1="19" x2="19" y2="5"/><circle cx="7.5" cy="7.5" r="2.3"/><circle cx="16.5" cy="16.5" r="2.3"/>'
  };
  function iconSVG(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" ' +
      'stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || ICONS.target) + '</svg>';
  }

  var gallery = document.getElementById('gallery');
  if (!gallery) return;

  function plain(html) { return html.replace(/<[^>]+>/g, ''); }

  function caption(c) {
    return (c.hook ? c.hook + '.\n\n' : '') + c.num + ' — ' + plain(c.head) + ' ' + c.sub +
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
      '<div class="sc-bg">' + iconSVG(c.icon) + '</div>' +
      '<div class="sc-top"><span class="sc-brand">SAFETY<span>·</span>THEATRE</span>' +
        '<span class="sc-cat">' + c.cat + '</span></div>' +
      '<div class="sc-mid">' +
        (c.hook ? '<div class="sc-hook">' + c.hook + '</div>' : '') +
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
