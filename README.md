# About this Script
Shutting down those damn preview sounds because it just auto turn on after every refresh  
This script was "Vibed" into existence. If you find bugs, DM me on Discord, open issue, or just Vibe a new version and send PR  
[中文 TW 版本 README](./README_zhTW.md)

# How to Use
1. Install Tampermonkey
2. Pin Tampermonkey on the extension bar
3. Right click and follow Tampermonkey setup
    - Manage Extension
        - Enable `Developer Mode`
        - Enable `Allow user script` 
4. Right-click the Tampermonkey and select `Create a new script`
5. Paste the contents of [script.js](./script.js)
6. Press Ctrl + S to save

# Expected Behavior
If you refresh YouTube and still hear sound, you likely have more than one YouTube tab open. Close the entire Chrome window and restart it (Use Ctrl + Shift + T to restore tabs if they don't auto-reopen)  
It is normal for videos to be muted at first time. These two settings (previews and main player) are stored separately, but both default to muted initially
