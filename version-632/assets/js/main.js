(function() {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-menu-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function() {
      panel.classList.toggle("open");
    });
  }

  function setupHeaderSearch() {
    var forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function(form) {
      form.addEventListener("submit", function(event) {
        var input = form.querySelector("input[type='search']");
        if (!input || !input.value.trim()) {
          return;
        }
        if (form.classList.contains("top-search") || form.classList.contains("hero-search")) {
          return;
        }
        event.preventDefault();
      });
    });
  }

  function setupFiltering() {
    var grid = document.querySelector("[data-search-grid]");
    var input = document.querySelector("[data-filter-input]");
    var buttons = document.querySelectorAll("[data-category-filter]");
    if (!grid || !input) {
      return;
    }

    var activeCategory = "all";
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (initial) {
      input.value = initial;
    }
    if (input.hasAttribute("data-autofocus")) {
      input.focus();
    }

    function applyFilter() {
      var query = normalize(input.value);
      var cards = grid.querySelectorAll("[data-card]");
      cards.forEach(function(card) {
        var title = normalize(card.getAttribute("data-title"));
        var category = normalize(card.getAttribute("data-category"));
        var tags = normalize(card.getAttribute("data-tags"));
        var matchesText = !query || title.indexOf(query) > -1 || category.indexOf(query) > -1 || tags.indexOf(query) > -1;
        var matchesCategory = activeCategory === "all" || category === normalize(activeCategory);
        card.classList.toggle("hidden-card", !(matchesText && matchesCategory));
      });
    }

    input.addEventListener("input", applyFilter);
    buttons.forEach(function(button) {
      button.addEventListener("click", function() {
        buttons.forEach(function(item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        activeCategory = button.getAttribute("data-category-filter") || "all";
        applyFilter();
      });
    });
    applyFilter();
  }

  function setupHero() {
    var reel = document.querySelector("[data-hero-reel]");
    if (!reel) {
      return;
    }
    var slides = Array.prototype.slice.call(reel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(reel.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, idx) {
        slide.classList.toggle("active", idx === current);
      });
      dots.forEach(function(dot, idx) {
        dot.classList.toggle("active", idx === current);
      });
    }

    dots.forEach(function(dot, idx) {
      dot.addEventListener("click", function() {
        show(idx);
      });
    });

    window.setInterval(function() {
      show(current + 1);
    }, 5200);
  }

  window.initMoviePlayer = function(videoId, maskId, streamUrl) {
    var video = document.getElementById(videoId);
    var mask = document.getElementById(maskId);
    if (!video || !mask || !streamUrl) {
      return;
    }

    var loaded = false;

    function loadStream() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video.hlsInstance = hls;
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      loadStream();
      mask.classList.add("hidden");
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function() {});
      }
    }

    mask.addEventListener("click", play);
    video.addEventListener("click", function() {
      if (video.paused) {
        play();
      }
    });
  };

  ready(function() {
    setupMenu();
    setupHeaderSearch();
    setupFiltering();
    setupHero();
  });
})();
