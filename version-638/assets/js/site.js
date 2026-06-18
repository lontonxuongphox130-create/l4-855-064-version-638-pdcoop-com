(function () {
  var $ = function (selector, root) {
    return (root || document).querySelector(selector);
  };

  var $$ = function (selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  };

  function setupMenu() {
    var toggle = $('[data-menu-toggle]');
    var panel = $('[data-menu-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $$('[data-hero-slide]', hero);
    var dots = $$('[data-hero-dot]', hero);
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10));
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function runFilter(value) {
    var query = normalize(value);
    var cards = $$('.movie-card');
    var shown = 0;
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-meta') + ' ' + card.getAttribute('data-title'));
      var match = !query || text.indexOf(query) !== -1;
      card.style.display = match ? '' : 'none';
      if (match) {
        shown += 1;
      }
    });
    var empty = $('[data-empty-state]');
    if (empty) {
      empty.classList.toggle('show', shown === 0);
    }
  }

  function setupFilters() {
    var input = $('[data-card-filter]');
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (q) {
      input.value = q;
      runFilter(q);
    }
    input.addEventListener('input', function () {
      runFilter(input.value);
    });
    $$('[data-filter-value]').forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-filter-value') || '';
        input.value = value;
        runFilter(value);
      });
    });
  }

  function setupGlobalSearch() {
    $$('[data-global-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          window.location.href = './search.html';
        }
      });
    });
  }

  window.initMoviePlayer = function (videoId, coverId, buttonId, source) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var button = document.getElementById(buttonId);
    if (!video || !cover || !source) {
      return;
    }
    var attached = false;
    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }
    function start() {
      attachSource();
      cover.classList.add('hidden');
      video.controls = true;
      var play = video.play();
      if (play && typeof play.catch === 'function') {
        play.catch(function () {});
      }
    }
    cover.addEventListener('click', start);
    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        start();
      });
    }
    video.addEventListener('click', function () {
      if (!attached || video.paused) {
        start();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupGlobalSearch();
  });
})();
