(function () {
  'use strict';

  function selectAll(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  function setupMobileNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      toggle.textContent = nav.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', slider);
    var dots = selectAll('[data-hero-dot]', slider);
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }
  }

  function setupPageFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    if (!panel) {
      return;
    }

    var input = panel.querySelector('[data-filter-input]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var reset = panel.querySelector('[data-filter-reset]');
    var count = panel.querySelector('[data-filter-count]');
    var cards = selectAll('[data-card]');

    var years = Array.from(new Set(cards.map(function (card) {
      return card.getAttribute('data-year') || '';
    }).filter(Boolean))).sort().reverse();

    var types = Array.from(new Set(cards.map(function (card) {
      return card.getAttribute('data-type') || '';
    }).filter(Boolean))).sort();

    years.forEach(function (year) {
      var option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    });

    types.forEach(function (type) {
      var option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      typeSelect.appendChild(option);
    });

    function applyFilter() {
      var keyword = normalize(input.value);
      var year = yearSelect.value;
      var type = typeSelect.value;
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-title'));
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var matched = (!keyword || text.indexOf(keyword) !== -1) && (!year || cardYear === year) && (!type || cardType === type);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部';
      }
    }

    [input, yearSelect, typeSelect].forEach(function (element) {
      element.addEventListener('input', applyFilter);
      element.addEventListener('change', applyFilter);
    });

    if (reset) {
      reset.addEventListener('click', function () {
        input.value = '';
        yearSelect.value = '';
        typeSelect.value = '';
        applyFilter();
      });
    }

    applyFilter();
  }

  function setupVideoPlayers() {
    selectAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var status = player.querySelector('[data-player-status]');
      var src = player.getAttribute('data-src');
      var hlsInstance = null;
      var loaded = false;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function startPlayback() {
        if (!src || !video) {
          setStatus('当前影片暂未配置播放源。');
          return;
        }

        player.classList.add('is-playing');

        if (!loaded) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            loaded = true;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              setStatus('播放源加载完成，正在播放。');
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
              if (data && data.fatal) {
                setStatus('播放源加载失败，请稍后重试。');
              }
            });
            loaded = true;
          } else {
            video.src = src;
            loaded = true;
            setStatus('当前浏览器暂不支持该播放方式，已尝试使用原生播放。');
          }
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setStatus('浏览器阻止了自动播放，请点击视频控件继续播放。');
          });
        }
      }

      if (button) {
        button.addEventListener('click', startPlayback);
      }

      player.addEventListener('click', function (event) {
        if (event.target === player || event.target === button) {
          startPlayback();
        }
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
        setStatus('正在播放。');
      });

      video.addEventListener('pause', function () {
        setStatus('已暂停，可继续播放。');
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function createSearchCard(movie) {
    var title = escapeHtml(movie.title);
    var oneLine = escapeHtml(movie.oneLine);
    var year = escapeHtml(movie.year);
    var region = escapeHtml(movie.region);
    var category = escapeHtml(movie.category);
    var url = encodeURI(movie.url || '#');
    var cover = encodeURI(movie.cover || '1.jpg');

    return [
      '<article class="movie-card movie-card-wide" data-card>',
      '  <a class="wide-cover" href="' + url + '" aria-label="观看 ' + title + '">',
      '    <img src="' + cover + '" alt="' + title + '" loading="lazy" onerror="this.parentElement.classList.add(&quot;is-missing-image&quot;); this.remove();">',
      '    <span class="play-icon">▶</span>',
      '  </a>',
      '  <div class="wide-body">',
      '    <a class="movie-title" href="' + url + '">' + title + '</a>',
      '    <p class="movie-desc">' + oneLine + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + year + '</span>',
      '      <span>' + region + '</span>',
      '      <span>' + category + '</span>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function setupSearchPage() {
    var data = window.MOVIE_SEARCH_DATA;
    var form = document.querySelector('[data-search-form]');
    var results = document.querySelector('[data-search-results]');
    var count = document.querySelector('[data-search-count]');
    if (!data || !form || !results) {
      return;
    }

    var queryInput = form.querySelector('[name="q"]');
    var yearSelect = form.querySelector('[name="year"]');
    var typeSelect = form.querySelector('[name="type"]');

    var years = Array.from(new Set(data.map(function (movie) {
      return String(movie.year || '');
    }).filter(Boolean))).sort().reverse();

    var types = Array.from(new Set(data.map(function (movie) {
      return movie.type || '';
    }).filter(Boolean))).sort();

    years.forEach(function (year) {
      var option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    });

    types.forEach(function (type) {
      var option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      typeSelect.appendChild(option);
    });

    queryInput.value = getQueryParam('q');
    yearSelect.value = getQueryParam('year');
    typeSelect.value = getQueryParam('type');

    function render() {
      var keyword = normalize(queryInput.value);
      var year = yearSelect.value;
      var type = typeSelect.value;
      var matched = data.filter(function (movie) {
        var haystack = normalize([movie.title, movie.region, movie.type, movie.genre, movie.tags, movie.oneLine, movie.category].join(' '));
        return (!keyword || haystack.indexOf(keyword) !== -1) && (!year || String(movie.year) === year) && (!type || movie.type === type);
      });

      if (count) {
        count.textContent = '找到 ' + matched.length + ' 部影片';
      }

      if (!matched.length) {
        results.innerHTML = '<div class="search-results-empty">没有找到匹配影片，可以尝试更短的关键词或切换筛选条件。</div>';
        return;
      }

      results.innerHTML = matched.slice(0, 240).map(createSearchCard).join('');
      if (matched.length > 240) {
        results.insertAdjacentHTML('beforeend', '<div class="search-results-empty">已显示前 240 条结果，请继续输入关键词缩小范围。</div>');
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });

    [queryInput, yearSelect, typeSelect].forEach(function (element) {
      element.addEventListener('input', render);
      element.addEventListener('change', render);
    });

    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNavigation();
    setupHeroSlider();
    setupPageFilters();
    setupVideoPlayers();
    setupSearchPage();
  });
})();
