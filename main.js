const { app, BrowserWindow, ipcMain } = require('electron/main');
const path = require('node:path');
const { autoUpdater } = require('electron-updater');

let mainWindow;
let latestVersion = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    frame: false
  });

  mainWindow.setMenu(null);
  mainWindow.setResizable(false);
  mainWindow.loadFile('index.html');

  // 현재 버전 보내기
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('current-version', app.getVersion());
    if (latestVersion) {
      mainWindow.webContents.send('latest-version', latestVersion);
    }
  });

  // 업데이트가 있을 때 최신 버전 정보 사용자에게 알림
  autoUpdater.on('update-available', (info) => {
    latestVersion = info.version;
    mainWindow.webContents.send('update-available', latestVersion);
  });

  // 업데이트 다운로드 완료 후 사용자에게 알림
  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update-downloaded');
  });

  // 예외 처리
  autoUpdater.on('error', (error) => {
    console.error('업데이트 중 에러 발생:', error);
    mainWindow.webContents.send('update-error', error == null ? "알 수 없는 오류" : (error.stack || error).toString());
  });
};

app.whenReady().then(() => {
  // autoDownload를 false로 설정하여 자동 다운로드를 방지
  autoUpdater.autoDownload = false;

  createWindow();
  autoUpdater.checkForUpdates();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 업데이트 다운로드 요청 처리
ipcMain.on('download-update', () => {
  autoUpdater.downloadUpdate();
});

// 업데이트 설치 요청 처리
ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall();
});

// 창 제어 이벤트 처리
ipcMain.on('minimize-window', () => {
  mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on('close-window', () => {
  mainWindow.close();
});