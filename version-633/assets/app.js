(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupSearchForms() {
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || input.value.trim()) {
                    return;
                }
                event.preventDefault();
                input.focus();
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function move(step) {
            show(current + step);
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                move(1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                move(-1);
                play();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                move(1);
                play();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                play();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", play);
        play();
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var typeFilter = scope.querySelector("[data-type-filter]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            var count = scope.querySelector("[data-filter-count]");
            if (!cards.length) {
                return;
            }
            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var type = typeFilter ? typeFilter.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var words = (card.getAttribute("data-keywords") || "").toLowerCase();
                    var cardType = card.getAttribute("data-type") || "";
                    var matched = (!keyword || words.indexOf(keyword) !== -1) && (!type || cardType === type);
                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = visible;
                }
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            if (typeFilter) {
                typeFilter.addEventListener("change", apply);
            }
            apply();
        });
    }

    function cardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "" +
            "<article class=\"movie-card\">" +
            "<a class=\"movie-poster\" href=\"./" + escapeHtml(movie.url) + "\">" +
            "<img src=\"./" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"category-badge\">" + escapeHtml(movie.category) + "</span>" +
            "<span class=\"duration-badge\">" + escapeHtml(movie.duration) + "</span>" +
            "<span class=\"play-hover\">▶</span>" +
            "</a>" +
            "<div class=\"movie-card-body\">" +
            "<a class=\"movie-title\" href=\"./" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a>" +
            "<p>" + escapeHtml(movie.description) + "</p>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "<div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>★ " + escapeHtml(movie.rating) + "</span></div>" +
            "</div>" +
            "</article>";
    }

    function setupSearchPage() {
        var page = document.querySelector("[data-search-page]");
        if (!page || !window.movieCatalog) {
            return;
        }
        var input = page.querySelector("[data-search-input]");
        var results = page.querySelector("[data-search-results]");
        var status = page.querySelector("[data-search-status]");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        if (input) {
            input.value = initialQuery;
        }

        function render(query) {
            var keyword = query.trim().toLowerCase();
            var matched = window.movieCatalog.filter(function (movie) {
                var text = [
                    movie.title,
                    movie.description,
                    movie.category,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    (movie.tags || []).join(" ")
                ].join(" ").toLowerCase();
                return !keyword || text.indexOf(keyword) !== -1;
            }).slice(0, 120);
            if (status) {
                status.textContent = keyword ? "找到 " + matched.length + " 条相关内容" : "显示热门推荐内容";
            }
            if (results) {
                results.innerHTML = matched.map(cardTemplate).join("");
            }
        }

        render(initialQuery);
        if (input) {
            input.addEventListener("input", function () {
                render(input.value);
            });
        }
    }

    ready(function () {
        setupMenu();
        setupSearchForms();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
})();
