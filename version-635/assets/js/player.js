function initPlayer(shell) {
  var video = shell.querySelector('video');
  var cover = shell.querySelector('[data-play]');
  var src = shell.getAttribute('data-src');
  var hls = null;
  var loaded = false;
  var Hls = window.Hls;

  function load() {
    if (loaded || !src || !video) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      loaded = true;
      return;
    }
    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      loaded = true;
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
    }
  }

  function play() {
    load();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    if (video) {
      video.play().catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', play);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
  }
}

Array.prototype.forEach.call(document.querySelectorAll('[data-player]'), initPlayer);
