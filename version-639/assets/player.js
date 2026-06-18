(() => {
  const video = document.querySelector('[data-player-video]');
  if (!video) return;
  const overlay = document.querySelector('[data-player-overlay]');
  const starters = document.querySelectorAll('[data-player-start]');
  const streamUrl = video.getAttribute('data-stream');
  let ready = false;
  let hlsInstance = null;
  const runPlay = () => {
    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(() => overlay?.classList.remove('is-hidden'));
    }
  };
  const attach = () => {
    if (ready || !streamUrl) return;
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      runPlay();
    } else if (window.Hls && Hls.isSupported()) {
      hlsInstance = new Hls({ enableWorker: true });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, runPlay);
    } else {
      video.src = streamUrl;
      runPlay();
    }
  };
  const play = () => {
    overlay?.classList.add('is-hidden');
    if (ready) {
      runPlay();
    } else {
      attach();
    }
  };
  starters.forEach((item) => item.addEventListener('click', play));
  video.addEventListener('click', () => {
    if (video.paused) play();
  });
  window.addEventListener('beforeunload', () => {
    if (hlsInstance) hlsInstance.destroy();
  });
})();
