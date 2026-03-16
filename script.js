// ==UserScript==
// @name         YouTube Mute Hover Previews
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Mute auto-playing hover/inline previews on YouTube without affecting watch/shorts volume
// @match        https://www.youtube.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // Only force the inline-playback mute preference, NOT the player volume.
    // yt-player-volume controls the volume for watch pages and Shorts 鈥?    // overwriting it causes the "volume resets to 0" bug.
    function persistInlineMutePreference() {
        try {
            const inlineMute = JSON.stringify({ data: 'true', expiration: Date.now() + 2592000000, creation: Date.now() });
            localStorage.setItem('yt-player-inline-playback-muted', inlineMute);
        } catch (e) {}
    }

    persistInlineMutePreference();

    // Prevent YouTube from un-muting inline playback previews
    const origSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
        if (key === 'yt-player-inline-playback-muted') {
            try {
                const parsed = JSON.parse(value);
                parsed.data = 'true';
                value = JSON.stringify(parsed);
            } catch (e) {
                value = JSON.stringify({ data: 'true', expiration: Date.now() + 2592000000, creation: Date.now() });
            }
        }
        return origSetItem.call(this, key, value);
    };

    // Returns true when the user is on a page with hover/inline previews
    // (i.e. NOT a /watch page and NOT a /shorts page)
    function isPreviewPage() {
        return location.pathname !== '/watch' && !location.pathname.startsWith('/shorts');
    }

    // Returns true if the element is a hover/inline preview video
    // (not part of the main player, and we're on a preview page)
    function isPreviewElement(el) {
        if (!isPreviewPage()) return false;
        if (el.closest('#movie_player')) return false;
        if (el.closest('#shorts-player')) return false;
        return true;
    }

    // Mute all preview video elements
    function mutePreviewVideos() {
        if (!isPreviewPage()) return;
        document.querySelectorAll('video, audio').forEach(el => {
            if (el.closest('#movie_player') || el.closest('#shorts-player')) return;
            if (!el.muted) {
                el.muted = true;
                el.volume = 0;
            }
        });
    }

    // Intercept play() to mute before audio starts (only for previews)
    const origPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
        if (isPreviewElement(this)) {
            this.muted = true;
            this.volume = 0;
        }
        return origPlay.apply(this, arguments);
    };

    // Intercept volume setter (only block volume changes for previews)
    const volumeDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'volume');
    Object.defineProperty(HTMLMediaElement.prototype, 'volume', {
        get: volumeDesc.get,
        set: function (val) {
            if (isPreviewElement(this)) {
                return volumeDesc.set.call(this, 0);
            }
            return volumeDesc.set.call(this, val);
        },
        configurable: true,
    });

    // Intercept muted setter (only force mute for previews)
    const mutedDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'muted');
    Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
        get: mutedDesc.get,
        set: function (val) {
            if (isPreviewElement(this)) {
                return mutedDesc.set.call(this, true);
            }
            return mutedDesc.set.call(this, val);
        },
        configurable: true,
    });

    // Watch for DOM changes
    const observer = new MutationObserver(mutePreviewVideos);
    if (document.documentElement) {
        observer.observe(document.documentElement, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.documentElement, { childList: true, subtree: true });
        });
    }

    // Re-apply on YouTube SPA navigation
    window.addEventListener('yt-navigate-finish', () => {
        persistInlineMutePreference();
        mutePreviewVideos();
    });

    // Fallback periodic check
    setInterval(() => {
        persistInlineMutePreference();
        mutePreviewVideos();
    }, 2000);
})();
