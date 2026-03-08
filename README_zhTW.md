# 關於這份腳本
把那該死的預覽聲音關掉，不然刷新都會有一堆毛  
阿這份 Vibe 出來的，有 Bug 的話私訊 DC 或開 Issue，或是你想 Vibe 一個新的發 PR

# 腳本
- [script.js](./script.js) - 主要腳本，關掉預覽聲音
- [volume.js](./volume.js) - 不直接禁音，單純把音量調到 50% (感謝青花魚提供)

# 使用方式
1. 安裝 [Tampermonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en)
2. 按照 Tampermonkey 流程
    - 管理套件
        - 打開 Developer Mode
        - 打開 Allow user script (允許使用者腳本) (maybe)  
3. 對 Tampermonkey 右鍵新增腳本
4. 貼上 [script.js](./script.js)
5. Ctrl + S 儲存
6. 去 YouTube 刷新頁面 (Ctrl + R)

# 預期行為
1. 如果打開 YouTube 發現關掉刷新還是會有聲音，表示你開超過一個 YouTube，把整個 Chrome 視窗關掉然後重開 (如果分頁沒自動還原按 Ctrl + Shift + T)  
2. 第一次使用點開影片被禁音是正常的，這兩個分開儲存但是一開始預設都是禁音。
3. 重開 Browser 會暫時洗掉設定是預期的
4. Shorts 不給打開 (算是 Bug 但是誰會想開)，有人提 Issue 我再修
