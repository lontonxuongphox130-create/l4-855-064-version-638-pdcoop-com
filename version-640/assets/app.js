(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (toggle && mobilePanel) {
    toggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let heroIndex = 0;
  let heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    clearInterval(heroTimer);
    heroTimer = setInterval(function () {
      showSlide(heroIndex + 1);
    }, 5200);
  }

  document.querySelectorAll('[data-hero-next]').forEach(function (button) {
    button.addEventListener('click', function () {
      showSlide(heroIndex + 1);
      startHero();
    });
  });

  document.querySelectorAll('[data-hero-prev]').forEach(function (button) {
    button.addEventListener('click', function () {
      showSlide(heroIndex - 1);
      startHero();
    });
  });

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      startHero();
    });
  });

  showSlide(0);
  startHero();

  const params = new URLSearchParams(window.location.search);
  const keyword = params.get('q') || '';
  const filterInput = document.querySelector('[data-filter-keyword]');
  const regionSelect = document.querySelector('[data-filter-region]');
  const typeSelect = document.querySelector('[data-filter-type]');
  const yearSelect = document.querySelector('[data-filter-year]');
  const genreSelect = document.querySelector('[data-filter-genre]');
  const cards = Array.from(document.querySelectorAll('[data-card]'));

  if (filterInput && keyword) {
    filterInput.value = keyword;
  }

  function valueOf(element) {
    return element ? element.value.trim() : '';
  }

  function includesText(source, target) {
    return !target || String(source || '').toLowerCase().includes(target.toLowerCase());
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    const q = valueOf(filterInput);
    const region = valueOf(regionSelect);
    const type = valueOf(typeSelect);
    const year = valueOf(yearSelect);
    const genre = valueOf(genreSelect);

    cards.forEach(function (card) {
      const haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(' ');

      const matched = includesText(haystack, q)
        && (!region || card.dataset.region === region)
        && (!type || card.dataset.type === type)
        && (!year || card.dataset.year === year)
        && (!genre || includesText(card.dataset.genre, genre) || includesText(card.dataset.tags, genre));

      card.style.display = matched ? '' : 'none';
    });
  }

  [filterInput, regionSelect, typeSelect, yearSelect, genreSelect].forEach(function (element) {
    if (element) {
      element.addEventListener('input', applyFilters);
      element.addEventListener('change', applyFilters);
    }
  });

  applyFilters();

  document.querySelectorAll('[data-player]').forEach(function (player) {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');
    const stream = player.getAttribute('data-stream');
    let bound = false;
    let hlsInstance = null;

    function bindVideo() {
      if (!video || !stream || bound) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      bound = true;
    }

    function playVideo() {
      bindVideo();
      player.classList.add('is-playing');
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    if (button && video) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          player.classList.remove('is-playing');
        }
      });
      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
