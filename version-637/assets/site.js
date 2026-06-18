(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function normalize(text) {
        return String(text || "").toLowerCase().trim();
    }

    function initFiltering() {
        var input = document.querySelector("[data-search-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
        var empty = document.querySelector(".no-results");
        if (!cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var queryFromUrl = params.get("q");
        var activeType = "all";
        if (input && queryFromUrl) {
            input.value = queryFromUrl;
        }
        function apply() {
            var query = normalize(input ? input.value : "");
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search") || card.textContent);
                var type = normalize(card.getAttribute("data-type") || "");
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchType = activeType === "all" || type === normalize(activeType);
                var show = matchQuery && matchType;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                buttons.forEach(function (item) {
                    item.classList.remove("active");
                });
                button.classList.add("active");
                activeType = button.getAttribute("data-filter-value") || "all";
                apply();
            });
        });
        apply();
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("active", itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("active", itemIndex === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }
        dots.forEach(function (dot, itemIndex) {
            dot.addEventListener("click", function () {
                show(itemIndex);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        show(0);
        start();
    }

    window.setupMoviePlayer = function (videoId, coverId, streamUrl) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        if (!video || !streamUrl) {
            return;
        }
        var started = false;
        var hlsInstance = null;
        function hideCover() {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        }
        function playVideo() {
            var playAction = video.play();
            if (playAction && typeof playAction.catch === "function") {
                playAction.catch(function () {});
            }
        }
        function attachAndPlay() {
            hideCover();
            if (started) {
                playVideo();
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                playVideo();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                        video.src = streamUrl;
                        playVideo();
                    }
                });
                return;
            }
            video.src = streamUrl;
            playVideo();
        }
        if (cover) {
            cover.addEventListener("click", attachAndPlay);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                attachAndPlay();
            }
        });
        video.addEventListener("play", hideCover);
    };

    ready(function () {
        initMenu();
        initFiltering();
        initHero();
    });
})();
