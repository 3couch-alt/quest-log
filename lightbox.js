(function () {
  var zoomables = document.querySelectorAll('img.zoomable');
  if (!zoomables.length) return;
  if (typeof HTMLDialogElement === 'undefined') return; // very old browser: images just stay inline

  var dialog = null;
  var dialogImg = null;
  var lastFocused = null;

  function build() {
    dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.innerHTML =
      '<button class="lightbox-close" type="button" aria-label="Close">&times;</button>' +
      '<img class="lightbox-img" alt="">';
    document.body.appendChild(dialog);
    dialogImg = dialog.querySelector('.lightbox-img');

    dialog.querySelector('.lightbox-close').addEventListener('click', function () {
      dialog.close();
    });

    // clicking the empty space around the image closes it
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close();
    });

    // showModal() closes on Escape by itself, but belt-and-braces in case a
    // browser swallows the default behaviour
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        dialog.close();
      }
    });

    dialog.addEventListener('close', function () {
      if (lastFocused) lastFocused.focus();
    });
  }

  function open(img) {
    if (!dialog) build();
    lastFocused = img;
    dialogImg.src = img.currentSrc || img.src;
    dialogImg.alt = img.alt;
    // never blow an image up past its own resolution
    dialogImg.style.maxWidth = Math.min(760, img.naturalWidth || 760) + 'px';
    dialog.showModal();
    dialog.scrollTop = 0;
  }

  Array.prototype.forEach.call(zoomables, function (img) {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    if (!img.title) img.title = 'Click to enlarge';

    img.addEventListener('click', function () { open(img); });
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(img);
      }
    });
  });
})();
