
(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));

    players.forEach(function (player) {
      var video = player.querySelector('video[data-src]');
      var button = player.querySelector('[data-player-start]');
      var source = video ? video.getAttribute('data-src') : '';
      var initialized = false;
      var hls = null;

      if (!video || !source) {
        return;
      }

      function initializePlayer() {
        if (initialized) {
          return;
        }

        initialized = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          return;
        }

        video.src = source;
      }

      function play() {
        initializePlayer();
        player.classList.add('is-playing');

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            player.classList.remove('is-playing');
            video.controls = true;
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          player.classList.remove('is-playing');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  });
})();
