Background track for the site's music toggle.

The player looks for these in order and uses the first one it finds:

    lofi.mp3     (preferred - plays everywhere)
    lofi.ogg     (current - does NOT play in Safari, macOS or iOS)

The control only appears if one of them exists, and nothing is downloaded
by visitors until they actually press play.

NOTE: the current track is Ogg Vorbis. Safari has never supported Ogg, so
iPhone, iPad and Mac Safari visitors will see the button but hear nothing.
Adding an mp3 alongside it fixes that automatically - no code change needed,
since mp3 is checked first.

Good sources for free music:
  - Pixabay Music        https://pixabay.com/music/   (no attribution required)
  - Free Music Archive   https://freemusicarchive.org/
  - Incompetech          https://incompetech.com/     (credit required)
