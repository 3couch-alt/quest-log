(function () {
  /* Ambient audio toggle.
     Never plays on its own. Every page load starts silent and stays that way
     until the visitor presses the button — no autoplay, and no resuming
     across page navigations either.
     - the <audio> element uses preload="none", so zero bytes are fetched
       until play is pressed
     - if the track file is missing, the control never appears at all */

  // mp3 first: Safari (macOS and iOS) does not play Ogg Vorbis, so an mp3
  // is preferred whenever one is present.
  var TRACKS = ['audio/lofi.mp3', 'audio/lofi.ogg'];
  var VOLUME = 0.35;

  // Don't bother on the admin page.
  if (/admin\.html$/i.test(window.location.pathname)) return;

  // Posts live one level down, so resolve the path from the site root.
  var depth = window.location.pathname.replace(/[^/]+$/, '').split('/').filter(Boolean).length;
  var prefix = depth > 0 ? '../'.repeat(depth) : '';

  function build(src) {
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
        audio.play().then(function () { setOn(true); }).catch(function () { setOn(false); });
      } else {
        audio.pause();
        setOn(false);
      }
    });

    setOn(false);
    document.body.appendChild(audio);
    document.body.appendChild(btn);
  }

  // Show the control only if a track actually exists, taking the first
  // available format in preference order.
  (function probe(i) {
    if (i >= TRACKS.length) return; // no track, no control
    var src = prefix + TRACKS[i];
    fetch(src, { method: 'HEAD' })
      .then(function (res) { res.ok ? build(src) : probe(i + 1); })
      .catch(function () { probe(i + 1); });
  })(0);
})();
