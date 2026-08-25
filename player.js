(function () {
  /* Ambient audio toggle.
     Deliberately silent and weightless until the visitor asks for it:
     - the <audio> element uses preload="none", so zero bytes are fetched
       until play is pressed
     - if the track file is missing, the control never appears at all
     - the on/off choice is remembered across pages */

  var TRACK = 'audio/lofi.mp3';
  var KEY = 'ql_music_on';
  var VOLUME = 0.35;

  // Don't bother on the admin page.
  if (/admin\.html$/i.test(window.location.pathname)) return;

  // Posts live one level down, so resolve the path from the site root.
  var depth = window.location.pathname.replace(/[^/]+$/, '').split('/').filter(Boolean).length;
  var src = (depth > 0 ? '../'.repeat(depth) : '') + TRACK;

  function build() {
    var audio = document.createElement('audio');
    audio.src = src;
    audio.loop = true;
    audio.preload = 'none';
    audio.volume = VOLUME;

    var btn = document.createElement('button');
    btn.className = 'music-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = '<span class="music-icon" aria-hidden="true">♪</span><span class="music-label">lofi</span>';

    function setOn(on) {
      btn.classList.toggle('playing', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('aria-label', on ? 'Turn background music off' : 'Turn background music on');
    }

    btn.addEventListener('click', function () {
      if (audio.paused) {
        audio.play().then(function () {
          setOn(true);
          try { localStorage.setItem(KEY, '1'); } catch (e) {}
        }).catch(function () {
          setOn(false);
        });
      } else {
        audio.pause();
        setOn(false);
        try { localStorage.removeItem(KEY); } catch (e) {}
      }
    });

    setOn(false);
    document.body.appendChild(audio);
    document.body.appendChild(btn);

    // If they had it on, try to pick back up after navigating. Browsers may
    // refuse until the page has been interacted with; failing is fine.
    var wanted = null;
    try { wanted = localStorage.getItem(KEY); } catch (e) {}
    if (wanted) {
      audio.play().then(function () { setOn(true); }).catch(function () { setOn(false); });
    }
  }

  // Only show the control if the track actually exists.
  fetch(src, { method: 'HEAD' })
    .then(function (res) { if (res.ok) build(); })
    .catch(function () { /* no track, no control */ });
})();
