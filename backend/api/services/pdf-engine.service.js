const puppeteer = require('puppeteer-core');
const os = require('os');
const fs = require('fs');

let browserInstance = null;
let launchPromise = null;

function detectChromePath() {
    if (os.platform() === 'win32') {
        const winPaths = [
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
        ];
        for (const p of winPaths) {
            if (fs.existsSync(p)) return p;
        }
    } else if (os.platform() === 'darwin') {
        const macPath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
        if (fs.existsSync(macPath)) return macPath;
    } else {
        const linuxPaths = [
            '/usr/bin/google-chrome',
            '/usr/bin/google-chrome-stable',
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium'
        ];
        for (const p of linuxPaths) {
            if (fs.existsSync(p)) return p;
        }
    }
    return null; 
}

async function getBrowser() {
    if (launchPromise) {
        return await launchPromise;
    }
    
    if (browserInstance && browserInstance.isConnected()) {
        return browserInstance;
    }

    console.log('[PDF Engine] Launching a new shared Chrome instance...');
    launchPromise = puppeteer.launch({
        executablePath: detectChromePath(),
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    }).then(browser => {
        browserInstance = browser;
        launchPromise = null;
        
        browserInstance.on('disconnected', () => {
            console.log('[PDF Engine] Chrome instance disconnected or crashed. It will be restarted on the next request.');
            browserInstance = null;
        });
        
        console.log('[PDF Engine] Chrome instance launched successfully.');
        return browserInstance;
    }).catch(err => {
        launchPromise = null;
        console.error('[PDF Engine] Failed to launch Chrome instance:', err);
        throw err;
    });

    return await launchPromise;
}

module.exports = {
    getBrowser
};
