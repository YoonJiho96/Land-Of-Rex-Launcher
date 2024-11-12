const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, '../../preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false
        },
        frame: false
    });

    mainWindow.setMenu(null);
    mainWindow.setResizable(false);
    mainWindow.loadFile('./index.html');

    // 현재 버전 전송
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('current-version', require('../../package.json').version);
    });

    return mainWindow;
}

function handleWindowEvents(window) {
    ipcMain.on('minimize-window', () => {
        window.minimize();
    });

    ipcMain.on('maximize-window', () => {
        if (window.isMaximized()) {
            window.unmaximize();
        } else {
            window.maximize();
        }
    });

    ipcMain.on('close-window', () => {
        window.close();
    });
}

module.exports = { createWindow, handleWindowEvents };