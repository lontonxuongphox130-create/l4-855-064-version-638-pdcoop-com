(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        return new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function setupPlayer(video) {
        var source = video.getAttribute("data-hls");
        var card = video.closest(".player-card");
        var startButton = card ? card.querySelector("[data-player-start]") : null;
        var hlsInstance = null;
        var connection = null;

        function bindWithHls(Hls, done) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                done();
            });
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                    return;
                }
                if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                    return;
                }
                hlsInstance.destroy();
            });
            window.setTimeout(done, 1200);
        }

        function connect() {
            if (connection) {
                return connection;
            }
            connection = new Promise(function (resolve) {
                if (!source) {
                    resolve();
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    resolve();
                    return;
                }
                loadHls().then(function (Hls) {
                    if (Hls && Hls.isSupported()) {
                        bindWithHls(Hls, resolve);
                        return;
                    }
                    video.src = source;
                    resolve();
                }).catch(function () {
                    video.src = source;
                    resolve();
                });
            });
            return connection;
        }

        function start() {
            connect().then(function () {
                video.controls = true;
                if (startButton) {
                    startButton.classList.add("is-hidden");
                }
                var task = video.play();
                if (task && typeof task.catch === "function") {
                    task.catch(function () {
                        if (startButton) {
                            startButton.classList.remove("is-hidden");
                        }
                    });
                }
            });
        }

        connect();
        if (startButton) {
            startButton.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (startButton) {
                startButton.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (startButton && video.currentTime === 0) {
                startButton.classList.remove("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        document.querySelectorAll("[data-hls-player]").forEach(setupPlayer);
    });
})();
