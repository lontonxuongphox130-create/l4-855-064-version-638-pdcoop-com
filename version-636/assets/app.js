(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  document.querySelectorAll('.site-search').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';

      if (value) {
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(value);
      }
    });
  });

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dotsWrap = carousel.querySelector('.hero-dots');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      if (dotsWrap) {
        Array.prototype.slice.call(dotsWrap.querySelectorAll('.hero-dot')).forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === index);
        });
      }
    }

    if (dotsWrap) {
      slides.forEach(function (_, slideIndex) {
        var dot = document.createElement('button');
        dot.className = 'hero-dot' + (slideIndex === 0 ? ' active' : '');
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换焦点影片');
        dot.addEventListener('click', function () {
          showSlide(slideIndex);
          restart();
        });
        dotsWrap.appendChild(dot);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    showSlide(0);
    restart();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]'));
  var filterItems = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
  var noResults = document.querySelector('[data-no-results]');
  var activeType = 'all';

  function normalize(value) {
    return (value || '').toString().toLowerCase();
  }

  function applyFilters() {
    var query = filterInput ? normalize(filterInput.value.trim()) : '';
    var visible = 0;

    filterItems.forEach(function (item) {
      var text = normalize(item.getAttribute('data-search'));
      var type = item.getAttribute('data-type') || '';
      var matchesQuery = !query || text.indexOf(query) !== -1;
      var matchesType = activeType === 'all' || type === activeType;
      var shouldShow = matchesQuery && matchesType;

      item.style.display = shouldShow ? '' : 'none';
      if (shouldShow) {
        visible += 1;
      }
    });

    if (noResults) {
      noResults.classList.toggle('show', visible === 0);
    }
  }

  if (filterInput || filterButtons.length) {
    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeType = button.getAttribute('data-filter-button') || 'all';
        filterButtons.forEach(function (other) {
          other.classList.toggle('active', other === button);
        });
        applyFilters();
      });
    });

    if (filterInput) {
      filterInput.addEventListener('input', applyFilters);
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');

      if (q) {
        filterInput.value = q;
      }
    }

    applyFilters();
  }

  window.initStreamPlayer = function (videoId, overlayId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var started = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (started) {
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      attachSource();

      if (overlay) {
        overlay.classList.add('hidden');
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove('hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (!started || video.paused) {
        play();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  };
})();
