
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
    initMobileMenu();
    initHeroSlider();
    initFilterPanels();
    initGlobalSearch();
  });

  function initMobileMenu() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-to]'));
    var prev = slider.querySelector('[data-slide-prev]');
    var next = slider.querySelector('[data-slide-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide-to')) || 0);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function initFilterPanels() {
    var grids = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid]'));

    grids.forEach(function (grid) {
      var section = grid.closest('section') || document;
      var search = section.querySelector('[data-filter-search]');
      var year = section.querySelector('[data-filter-year]');
      var region = section.querySelector('[data-filter-region]');
      var clear = section.querySelector('[data-filter-clear]');
      var empty = section.querySelector('[data-filter-empty]');
      var items = Array.prototype.slice.call(grid.querySelectorAll('[data-filter-item]'));

      fillSelect(year, unique(items.map(function (item) {
        return item.getAttribute('data-year') || '';
      })).sort().reverse());

      fillSelect(region, unique(items.map(function (item) {
        return item.getAttribute('data-region') || '';
      })).sort());

      function apply() {
        var query = normalize(search ? search.value : '');
        var selectedYear = year ? year.value : '';
        var selectedRegion = region ? region.value : '';
        var visible = 0;

        items.forEach(function (item) {
          var haystack = normalize([
            item.getAttribute('data-title'),
            item.getAttribute('data-year'),
            item.getAttribute('data-region'),
            item.getAttribute('data-genre'),
            item.getAttribute('data-category'),
            item.getAttribute('data-tags')
          ].join(' '));

          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesYear = !selectedYear || item.getAttribute('data-year') === selectedYear;
          var matchesRegion = !selectedRegion || item.getAttribute('data-region') === selectedRegion;
          var shouldShow = matchesQuery && matchesYear && matchesRegion;

          item.hidden = !shouldShow;
          if (shouldShow) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [search, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      if (clear) {
        clear.addEventListener('click', function () {
          if (search) {
            search.value = '';
          }
          if (year) {
            year.value = '';
          }
          if (region) {
            region.value = '';
          }
          apply();
        });
      }
    });
  }

  function initGlobalSearch() {
    var input = document.querySelector('[data-global-search]');
    var clear = document.querySelector('[data-global-clear]');
    var results = document.querySelector('[data-global-results]');
    var stats = document.querySelector('[data-global-stats]');

    if (!input || !results || !window.MOVIES) {
      return;
    }

    function render() {
      var query = normalize(input.value);
      var movies = window.MOVIES || [];
      var matches = [];

      if (query) {
        matches = movies.filter(function (movie) {
          var haystack = normalize([
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            movie.category,
            (movie.tags || []).join(' '),
            movie.oneLine
          ].join(' '));
          return haystack.indexOf(query) !== -1;
        }).slice(0, 80);
      }

      if (!query) {
        stats.textContent = '输入关键词开始搜索。';
        results.innerHTML = '';
        return;
      }

      stats.textContent = '找到 ' + matches.length + ' 条结果，最多显示前 80 条。';
      results.innerHTML = matches.map(function (movie) {
        return [
          '<a class="search-result-item" href="' + escapeHtml(movie.url) + '">',
          '  <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '  <span>',
          '    <h3>' + escapeHtml(movie.title) + '</h3>',
          '    <p>' + escapeHtml(movie.oneLine || '') + '</p>',
          '    <small>' + escapeHtml([movie.year, movie.region, movie.genre, movie.category, movie.rating + '分'].join(' · ')) + '</small>',
          '  </span>',
          '  <span class="btn-primary">查看详情</span>',
          '</a>'
        ].join('');
      }).join('');
    }

    input.addEventListener('input', render);

    if (clear) {
      clear.addEventListener('click', function () {
        input.value = '';
        input.focus();
        render();
      });
    }
  }

  function unique(values) {
    var seen = Object.create(null);
    return values.filter(function (value) {
      if (!value || seen[value]) {
        return false;
      }
      seen[value] = true;
      return true;
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }

    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
