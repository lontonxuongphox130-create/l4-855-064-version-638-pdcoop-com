(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === index);
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
      }
    }

    dots.forEach(function (dot, position) {
      dot.addEventListener("click", function () {
        show(position);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function initSearch() {
    var input = document.querySelector("[data-page-search]");
    var grid = document.querySelector("[data-search-grid]");
    if (!input || !grid) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get("q") || "";
    var category = document.querySelector("[data-category-filter]");
    var year = document.querySelector("[data-year-filter]");
    var region = document.querySelector("[data-region-filter]");
    var empty = document.querySelector("[data-empty-state]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
    input.value = keyword;

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var text = normalize(input.value);
      var catValue = category ? category.value : "";
      var yearValue = year ? year.value : "";
      var regionValue = region ? region.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var matched = true;
        if (text && haystack.indexOf(text) === -1) {
          matched = false;
        }
        if (catValue && card.getAttribute("data-category") !== catValue) {
          matched = false;
        }
        if (yearValue && card.getAttribute("data-year") !== yearValue) {
          matched = false;
        }
        if (regionValue && card.getAttribute("data-region") !== regionValue) {
          matched = false;
        }
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    input.addEventListener("input", apply);
    if (category) {
      category.addEventListener("change", apply);
    }
    if (year) {
      year.addEventListener("change", apply);
    }
    if (region) {
      region.addEventListener("change", apply);
    }
    apply();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      if (!video || !button) {
        return;
      }
      var hlsInstance = null;

      function bind() {
        var url = video.getAttribute("data-video-url");
        if (!url || video.dataset.bound === "1") {
          return;
        }
        video.dataset.bound = "1";
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
        } else {
          video.src = url;
        }
      }

      function play() {
        bind();
        button.classList.add("is-hidden");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        button.classList.add("is-hidden");
      });
      video.addEventListener("ended", function () {
        button.classList.remove("is-hidden");
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
    initPlayers();
  });
})();
