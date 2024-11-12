const { app, BrowserWindow } = require('electron');
const path = require('path');

require('dotenv').config(); // 환경 변수 로드

const { createWindow, handleWindowEvents } = require('./scripts/modules/window');
const { initializeUpdater } = require('./scripts/modules/updater');
const { handleIPC } = require('./scripts/modules/ipcHandlers');
const { validateManifest } = require('./scripts/modules/manifestValidator');
const { checkInstalled } = require('./scripts/modules/checkGame');

let mainWindow;

function getExeDir() {
  return path.dirname(app.getPath('userData'));
}

app.whenReady().then(async () => {
  mainWindow = createWindow();

  handleWindowEvents(mainWindow);
  initializeUpdater(mainWindow);
  handleIPC(mainWindow, getExeDir());

  // 창 로드 완료 후 매니페스트 검증
  mainWindow.webContents.on('did-finish-load', async () => {
    // await validateManifest(getExeDir(), mainWindow);

    // 1.설치, 버전 확인
    await checkInstalled(getExeDir(), mainWindow);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
      handleWindowEvents(mainWindow);
      initializeUpdater(mainWindow);
      handleIPC(mainWindow, getExeDir());
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});