// ==UserScript==
// @name         YouTube Mute Hover Previews
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Permanently mute auto-playing hover/inline previews on YouTube
// @match        https://www.youtube.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // Force YouTube's inline player mute preference via localStorage
    // YouTube uses this key to remember mute state for inline playback
    function persistMutePreference() {
        try {
            // YouTube stores player preferences in yt-player-volume
            const muteData = JSON.stringify({ data: '{"volume":0,"muted":true}', expiration: Date.now() + 2592000000, creation: Date.now() });
            localStorage.setItem('yt-player-volume', muteData);

            // Also set inline playback mute
            const inlineMute = JSON.stringify({ data: 'true', expiration: Date.now() + 2592000000, creation: Date.now() });
            localStorage.setItem('yt-player-inline-playback-muted', inlineMute);
        } catch (e) {}
    }

    // Run immediately and on every navigation
    persistMutePreference();

    // Prevent YouTube from overwriting our mute preference
    const origSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
        if (key === 'yt-player-inline-playback-muted') {
            // Always force muted = true
            try {
                const parsed = JSON.parse(value);
                parsed.data = 'true';
                value = JSON.stringify(parsed);
            } catch (e) {
                // If not JSON, force it
                value = JSON.stringify({ data: 'true', expiration: Date.now() + 2592000000, creation: Date.now() });
            }
        }
        return origSetItem.call(this, key, value);
    };

    // Pages where hover previews play (not watch pages)
    function isNonWatchPage() {
        return location.pathname !== '/watch';
    }

    // Mute all preview video elements
    function mutePreviewVideos() {
        if (!isNonWatchPage()) return;
        document.querySelectorAll('video, audio').forEach(el => {
            if (el.closest('#movie_player')) return;
            if (!el.muted) {
                el.muted = true;
                el.volume = 0;
            }
        });
    }

    // Intercept play() to mute before audio starts
    const origPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
        if (isNonWatchPage() && !this.closest('#movie_player')) {
            this.muted = true;
            this.volume = 0;
        }
        return origPlay.apply(this, arguments);
    };

    // Intercept volume setter
    const volumeDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'volume');
    Object.defineProperty(HTMLMediaElement.prototype, 'volume', {
        get: volumeDesc.get,
        set: function (val) {
            if (isNonWatchPage() && !this.closest('#movie_player')) {
                return volumeDesc.set.call(this, 0);
            }
            return volumeDesc.set.call(this, val);
        },
        configurable: true,
    });

    // Intercept muted setter
    const mutedDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'muted');
    Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
        get: mutedDesc.get,
        set: function (val) {
            if (isNonWatchPage() && !this.closest('#movie_player')) {
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
        persistMutePreference();
        mutePreviewVideos();
    });

    // Fallback periodic check
    setInterval(() => {
        persistMutePreference();
        mutePreviewVideos();
    }, 2000);
})();
