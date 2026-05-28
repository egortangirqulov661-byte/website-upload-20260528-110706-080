(function () {
    function toggleMobileMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".site-search"));
        var items = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
        var empty = document.querySelector(".empty-state");
        if (!inputs.length || !items.length) {
            return;
        }
        function apply(value) {
            var keyword = value.trim().toLowerCase();
            var visible = 0;
            items.forEach(function (item) {
                var text = (item.getAttribute("data-search") || "").toLowerCase();
                var matched = !keyword || text.indexOf(keyword) !== -1;
                item.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
            inputs.forEach(function (input) {
                if (input.value !== value) {
                    input.value = value;
                }
            });
        }
        inputs.forEach(function (input) {
            input.addEventListener("input", function () {
                apply(input.value);
            });
        });
    }

    function initHeroCarousel() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        var prev = root.querySelector(".hero-prev");
        var next = root.querySelector(".hero-next");
        var index = 0;
        var timer;
        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
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
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    window.setupMoviePlayer = function (videoId, coverId, source) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        var loaded = false;
        if (!video || !source) {
            return;
        }
        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
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
        function play() {
            attach();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }
        if (cover) {
            cover.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (cover && video.currentTime === 0) {
                cover.classList.remove("is-hidden");
            }
        });
        attach();
    };

    document.addEventListener("DOMContentLoaded", function () {
        toggleMobileMenu();
        initSearch();
        initHeroCarousel();
    });
})();
