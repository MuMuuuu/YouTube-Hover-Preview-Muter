// ==UserScript==
// @name         YouTube VolumeDown Hover Previews
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Turn Down the volume of auto-playing hover/inline previews on YouTube
// @match        https://www.youtube.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==


(function () {
    'use strict';

    const TARGET_VOLUME = 0.5;  // Set desired volume level for previews (0.5 = 50%)
                                // 設定目標音量 50%

    // Pages where hover previews play (not watch pages)
    // 判斷是否為「非」觀看頁面 (例如首頁、訂閱頁)
    // 只有在這些頁面我們才介入，避免影響正在觀看的主影片
    function isNonWatchPage() {
        return location.pathname !== '/watch';
    }

    // 處理單個影片元素的邏輯
    function handleVideoElement(video) {
        // 1. Skip if this video is inside the main YouTube player (watch page)
        // 1. 如果是主播放器 (#movie_player) 則完全不處理
        if (video.closest('#movie_player')) return;

        // 2. Mark this video as processed to avoid duplicate handlers
        // 2. 標記已處理過，避免重複綁定事件
        if (video.dataset.volumeFixed) return;
        video.dataset.volumeFixed = 'true';

        // 3. Initial settings:
        //     3.1 Set volume to TARGET_VOLUME, but do not force mute
        //     3.2 Mute the preview
        // 3. 初始設定：
        //     3.1 將音量設為 50%
        //     3.2 將預覽設為靜音
        video.volume = TARGET_VOLUME;
        video.muted = true;

        // 4. Watch the volumechange event
        // Fired when the user clicks on the speaker to unmute it, or when YouTube attempts to adjust the volume
        // 4. 監聽音量變化
        // 當使用者點擊喇叭解開靜音，或者 YouTube 試圖調整音量時觸發
        video.addEventListener('volumechange', (event) => {
            // If this change results in a volume other than 0.5 (and not muted), force it back to 0.5
            // Doing this allows the user to switch between mute and sound, but when there is sound it will always be 50%
            // 如果這個變更導致音量不是 0.5 (且不是靜音狀態)，強行設回 0.5
            // 這樣做可以允許使用者切換靜音/有聲，但有聲時永遠是 50%
            if (video.volume !== TARGET_VOLUME && !video.muted) {
                video.volume = TARGET_VOLUME;
            }
        });
        
        // 5. Extra insurance: double check the volume when playback starts
        // 5. 額外保險：在播放開始時再次確認音量
        video.addEventListener('play', () => {
             if (video.volume !== TARGET_VOLUME) {
                 video.volume = TARGET_VOLUME;
             }
        });
    }

    // Sacn the page for video/audio elements and apply our handler
    // 掃描頁面上的影片元素
    function scanAndFixVideos() {
        if (!isNonWatchPage()) return;
        
        // Find out all 'video' and 'audio' tags
        // 找出所有影片與音訊標籤
        const mediaElements = document.querySelectorAll('video, audio');
        mediaElements.forEach(handleVideoElement);
    }

    // Watch for DOM changes
    // 監控 DOM 變化
    const observer = new MutationObserver(scanAndFixVideos);
    
    // Launch the observer
    // 啟動監控
    if (document.documentElement) {
        observer.observe(document.documentElement, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.documentElement, { childList: true, subtree: true });
        });
    }
    
    // Re-apply on YouTube SPA navigation
    // 處理 YouTube 的頁面導航(SPA 跳轉)事件
    window.addEventListener('yt-navigate-finish', scanAndFixVideos);

    // Fallback periodic check (1 time per 2000 milliseconds)
    // 定期檢查作為最後一道防線 (每 2 秒掃一次)
    setInterval(scanAndFixVideos, 2000);

})();