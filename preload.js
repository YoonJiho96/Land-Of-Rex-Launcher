const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('updater', {
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (event, version) => callback(version)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', () => callback()),
  onUpdateError: (callback) => ipcRenderer.on('update-error', (event, error) => callback(error)),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, progress) => callback(progress)),
  downloadUpdate: () => ipcRenderer.send('download-update'),
  installUpdate: () => ipcRenderer.send('install-update'),

  // 현재 버전을 받는 부분 추가
  onCurrentVersion: (callback) => ipcRenderer.on('current-version', (event, version) => callback(version)),
});

contextBridge.exposeInMainWorld('electron', {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  closeWindow: () => ipcRenderer.send('close-window')
});

// 게임 다운로드
contextBridge.exposeInMainWorld('api', {
  downloadGame: () => ipcRenderer.send('download-game'),
  onDownloadGameProgress: (callback) => ipcRenderer.on('download-game-progress', (event, progress) => callback(progress)),
  onDownloadGameComplete: (callback) => ipcRenderer.on('download-complete', () => callback()),
  onDownloadError: (callback) => ipcRenderer.on('download-error', (event, error) => callback(error)),

  // 업데이트 추가
  updateGame: () => ipcRenderer.send('update-game'),

  // 외부 URL 열기 API 추가
  openExternalURL: (url) => ipcRenderer.send('open-external-url', url)
});

// 게임 시작
contextBridge.exposeInMainWorld('game', {
  gameStart: () => ipcRenderer.send('game-start'),
  onGameStartError: (callback) => ipcRenderer.on('game-start-error', (event, errorMessage) => callback(errorMessage))
});

// 유효성 검사
contextBridge.exposeInMainWorld('validation', {
  onUpdateRequired: (callback) => ipcRenderer.on('update-required', (event, requireUpdate) => callback(requireUpdate)),
  onInstallRequired: (callback) => ipcRenderer.on('installation-required', (event, requireInstall) => callback(requireInstall)),
  onValidateGame: () => ipcRenderer.send('game-validate'),

  // 버튼 상태 변경 신호 수신
  onSetButtonState: (callback) => ipcRenderer.on('set-button-state', (event, buttonId, isDisabled) => callback(buttonId, isDisabled)),

  // 런처 상태 메시지
  onSetMessage: (callback) => ipcRenderer.on('set-message', (event, message, color) => callback(message, color)),
});

// 공지사항 API
contextBridge.exposeInMainWorld('noticeAPI', {
  getNotices: async (page, size) => {
    return await ipcRenderer.invoke('get-notices', page, size);
  }
});