const { ipcMain, shell } = require('electron');
const { downloadUpdate, installUpdate } = require('./updater');
const { downloadGame } = require('./s3Service');
const { doValidateGame, doValidateGameVersion } = require('./manifestValidator');
const path = require('path');
const { validateManifest } = require('./manifestValidator');
const { generateVersionJson, checkInstalled } = require('./checkGame');
const { execFile } = require('child_process');
const { GetNoticeList } = require('./noticeService');

const LOCAL_FOLDER = "land-of-rex-launcher/LandOfRex";
const GAME_EXE = "LandOfRex.exe";

function handleIPC(mainWindow, exeDir) {
    // 업데이트 IPC
    ipcMain.on('download-update', () => {
        downloadUpdate();
    });

    ipcMain.on('install-update', () => {
        installUpdate();
    });

    // 게임 다운로드 IPC
    ipcMain.on('download-game', async () => {
        mainWindow.webContents.send('set-button-state', 'download-button', true);
        mainWindow.webContents.send('set-message', '게임을 다운로드 중 입니다.', '#4CAF50');
        mainWindow.webContents.send('set-button-state', 'game-validate', true);
        try {
            const defaultDownloadPath = path.join(exeDir, LOCAL_FOLDER);
            await downloadGame(defaultDownloadPath, mainWindow);
            await validateManifest(exeDir, mainWindow);

            // 버전 정보 저장
            await generateVersionJson(exeDir, mainWindow);
            mainWindow.webContents.send('installation-required', false);
        } catch (error) {
            mainWindow.webContents.send('download-error', error.message || '알 수 없는 오류가 발생했습니다.');
        } finally {
            mainWindow.webContents.send('set-button-state', 'download-button', false);
            mainWindow.webContents.send('set-button-state', 'game-validate', false);
        }
    });

    // 게임 업데이트
    ipcMain.on('update-game', async () => {
        mainWindow.webContents.send('set-button-state', 'game-update-button', true);
        mainWindow.webContents.send('set-message', '게임을 업데이트 중 입니다.', '#4CAF50');
        mainWindow.webContents.send('set-button-state', 'game-validate', true);
        console.log("업데이트 시작");
        try {
            await doValidateGameVersion(exeDir, mainWindow);  // 서버 파일 다운로드
            await generateVersionJson(exeDir, mainWindow);  // 새 버전 정보 저장
        } catch (error) {
            mainWindow.webContents.send('download-error', error.message || '알 수 없는 오류가 발생했습니다.');
        } finally {
            mainWindow.webContents.send('set-button-state', 'game-update-button', false);
            mainWindow.webContents.send('set-button-state', 'game-validate', false)
        }
    });

    // 게임 시작 IPC
    ipcMain.on('game-start', () => {
        mainWindow.webContents.send('set-button-state', 'game-start-button', true);
        mainWindow.webContents.send('set-button-state', 'game-validate', true);
        try {
            const gamePath = path.join(exeDir, LOCAL_FOLDER, GAME_EXE);

            // 게임 실행
            const gameProcess = execFile(gamePath, (error) => {
                if (error) {
                    mainWindow.webContents.send('game-start-error', error.message || '게임 실행에 실패했습니다.');
                } else {
                    console.log("게임이 정상적으로 실행되었습니다.");
                }
            });

            // 게임 프로세스 종료 시 버튼 활성화
            gameProcess.on('close', (code) => {
                console.log(`게임 프로세스가 종료되었습니다. 종료 코드: ${code}`);
                mainWindow.webContents.send('set-button-state', 'game-start-button', false);
                mainWindow.webContents.send('set-button-state', 'game-validate', false)
            });

        } catch (error) {
            mainWindow.webContents.send('game-start-error', error.message);
            mainWindow.webContents.send('set-button-state', 'game-start-button', false); // 오류 시 버튼을 다시 활성화
            mainWindow.webContents.send('set-button-state', 'game-validate', false)
        }
    });

    // 게임 유효성 검사 IPC
    ipcMain.on('game-validate', async () => {
        mainWindow.webContents.send('set-message', '게임 파일 검사 중 입니다.', '#4CAF50');
        try {
            // doValidateGame(exeDir, mainWindow);
            if (await checkInstalled(exeDir, mainWindow) == true) {
                mainWindow.webContents.send('set-button-state', 'game-validate', true);
                mainWindow.webContents.send('set-button-state', 'game-start-button', true);
                mainWindow.webContents.send('set-button-state', 'game-update-button', true);
                await doValidateGameVersion(exeDir, mainWindow);
            }
            else {
                console.log("게임 설치 필요");
            }
        } catch (error) {
            mainWindow.webContents.send('validate-error', error.message);
        } finally {
            mainWindow.webContents.send('set-button-state', 'game-validate', false);
            mainWindow.webContents.send('set-button-state', 'game-start-button', false);
            mainWindow.webContents.send('set-button-state', 'game-update-button', false);
            console.log("검사 완료");
        }
    });

    // 공지사항 요청 IPC
    ipcMain.handle('get-notices', async (event, page, size) => {
        const zeroBasedPage = page - 1;
        const data = await GetNoticeList(zeroBasedPage, size);
        return data;
    });

    // 외부 URL 열기 IPC
    ipcMain.on('open-external-url', (event, url) => {
        shell.openExternal(url);
    });
}

module.exports = { handleIPC };