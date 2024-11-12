const { autoUpdater } = require('electron-updater');

function initializeUpdater(mainWindow) {
    autoUpdater.autoDownload = false;

    autoUpdater.on('update-available', (info) => {
        mainWindow.webContents.send('update-available', info.version);
    });

    autoUpdater.on('download-progress', (progressObj) => {
        mainWindow.webContents.send('download-progress', progressObj);
    });

    autoUpdater.on('update-downloaded', () => {
        mainWindow.webContents.send('update-downloaded');
    });

    autoUpdater.on('error', (error) => {
        console.error('업데이트 중 에러 발생:', error);
        mainWindow.webContents.send('update-error', error == null ? "알 수 없는 오류" : (error.stack || error).toString());
    });

    autoUpdater.checkForUpdates();
}

function downloadUpdate() {
    autoUpdater.downloadUpdate();
}

function installUpdate() {
    autoUpdater.quitAndInstall();
}

module.exports = { initializeUpdater, downloadUpdate, installUpdate };