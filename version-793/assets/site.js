(function () {
    function closestCards(root) {
        return Array.prototype.slice.call(root.querySelectorAll('.movie-card, .rank-row'));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupMenu() {
        var button = document.querySelector('.mobile-menu-button');
        if (!button) {
            return;
        }
        button.addEventListener('click', function () {
            document.body.classList.toggle('nav-open');
        });
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));
        panels.forEach(function (panel) {
            var container = panel.parentElement;
            var input = panel.querySelector('.movie-search');
            var selects = Array.prototype.slice.call(panel.querySelectorAll('.filter-select'));
            var targets = closestCards(container);

            function applyFilter() {
                var query = normalize(input ? input.value : '');
                var filterValues = {};
                selects.forEach(function (select) {
                    filterValues[select.getAttribute('data-filter')] = normalize(select.value);
                });

                targets.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesCategory = !filterValues.category || normalize(card.getAttribute('data-category')) === filterValues.category;
                    var matchesYear = !filterValues.year || normalize(card.getAttribute('data-year')) === filterValues.year;
                    card.classList.toggle('hidden', !(matchesQuery && matchesCategory && matchesYear));
                });
            }

            if (input) {
                input.addEventListener('input', applyFilter);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', applyFilter);
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero-carousel]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var thumbs = Array.prototype.slice.call(hero.querySelectorAll('.hero-thumb'));
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === active);
            });
            thumbs.forEach(function (thumb, i) {
                thumb.classList.toggle('active', i === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('click', function () {
                show(Number(thumb.getAttribute('data-slide')) || 0);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupFilters();
        setupHero();
    });
}());
