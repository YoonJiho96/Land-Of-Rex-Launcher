const { execFile } = require('child_process');
const path = require('path');

function launchGame(exeDir, mainWindow, LOCAL_FOLDER, GAME_EXE) {
    try {
        const gamePath = path.join(exeDir, LOCAL_FOLDER, GAME_EXE);
        execFile(gamePath, (error) => {
            if (error) {
                mainWindow.webContents.send('game-start-error', error.message || '게임 실행에 실패했습니다.');
            } else {
                console.log("게임이 정상적으로 실행되었습니다.");
            }
        });
    } catch (error) {
        mainWindow.webContents.send('game-start-error', error.message);
    }
}

module.exports = { launchGame };