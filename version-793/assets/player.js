function initMoviePlayer(videoId, coverId, url) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var ready = false;

    if (!video || !url) {
        return;
    }

    function attachSource() {
        if (ready) {
            return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(url);
            hls.attachMedia(video);
        } else {
            video.src = url;
        }
    }

    function playVideo() {
        attachSource();
        if (cover) {
            cover.classList.add('hidden');
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener('click', playVideo);
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });
    video.addEventListener('play', function () {
        if (cover) {
            cover.classList.add('hidden');
        }
    });
}
