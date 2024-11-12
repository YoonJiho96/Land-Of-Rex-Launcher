const fs = require('fs');
const path = require('path');

// version.json 초기 생성
async function generateVersionJson(exeDir, mainWindow) {
    try {
        const localVersionPath = path.join(exeDir, "land-of-rex-launcher", "version.json");

        // 서버에서 최신 버전 정보를 가져옵니다.
        const latestVersion = await checkLatestVersion();

        if (!latestVersion) {
            throw new Error("최신 버전을 확인할 수 없습니다.");
        }

        // version.json 파일에 저장할 데이터를 객체로 생성합니다.
        const versionData = { version: latestVersion };

        // version.json 파일 생성 및 데이터 저장
        fs.writeFileSync(localVersionPath, JSON.stringify(versionData, null, 2), 'utf-8');
        console.log("version.json 파일이 생성되었습니다.");

        // 생성 완료 메시지를 전송
        mainWindow.webContents.send('version-file-created', true);
    } catch (error) {
        console.error("version.json 생성 중 오류 발생:", error);
        mainWindow.webContents.send('version-file-error', error.message);
    }
}


// 설치 확인 전체 동작
async function checkInstalled(exeDir, mainWindow) {
    try {
        const GAME_FOLDER = "land-of-rex-launcher/LandOfRex";
        const gameFolderPath = path.join(exeDir, GAME_FOLDER);

        // 게임 폴더 없음
        if (!fs.existsSync(gameFolderPath)) {
            // 설치 필요
            console.log("게임 폴더 없음");
            mainWindow.webContents.send('installation-required', true);
            return false;
        }

        // 버전 확인
        const latestVersion = await checkLatestVersion();    // 서버 버전
        const localVersion = await checkLocalVersion(exeDir, mainWindow);     // 설치 버전

        console.log("server : " + latestVersion);
        console.log("local : " + localVersion);

        // version.json 없음
        if (localVersion == null) {
            // 버전 확인이 안됨 => 새로 설치 필요
            console.log("version.json 없음. 설치 필요");
            mainWindow.webContents.send('installation-required', true);
            return false;
        } else {
            const versionComparison = compareVersions(localVersion, latestVersion);
            if (versionComparison < 0) {
                // 서버 버전이 설치된 버전보다 높음 => 업데이트 필요
                console.log("업데이트가 필요합니다.");
                mainWindow.webContents.send('update-required', true);
            } else {
                console.log("최신 버전이 설치되어 있습니다.");
                mainWindow.webContents.send('update-required', false);
            }
        }

        return true;
    } catch (error) {
        mainWindow.webContents.send('game-start-error', error.message);
    }
}

// 버전 비교 함수
function compareVersions(v1, v2) {
    const v1Parts = v1.split('.').map(Number);
    const v2Parts = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
        const part1 = v1Parts[i] || 0;
        const part2 = v2Parts[i] || 0;

        if (part1 > part2) return 1;
        if (part1 < part2) return -1;
    }
    return 0;
}

// 서버 버전 확인
async function checkLatestVersion() {
    try {
        const fetch = (await import('node-fetch')).default;
        const apiUrl = 'https://k11e102.p.ssafy.io/api/v1/patches/latest'
        const response = await fetch(apiUrl, { method: 'GET' });

        if (!response.ok) {
            throw new Error(`서버 응답 오류: ${response.status}`);
        }

        const data = await response.json();
        return data.version;
    } catch (error) {
        console.error("버전 확인 중 오류 발생:", error);
        return null;
    }
}

// 로컬 버전 확인
async function checkLocalVersion(exeDir, mainWindow) {
    // 로컬 파일에서 버전 확인
    const localVersionPath = path.join(exeDir, "land-of-rex-launcher", "version.json");
    const GAME_FOLDER = "land-of-rex-launcher/LandOfRex";
    const gameFolderPath = path.join(exeDir, GAME_FOLDER);

    if (!fs.existsSync(gameFolderPath)) {
        // 설치 확인이 안됨 => 설치 필요
        mainWindow.webContents.send('installation-required', true);
        return null;
    }

    if (fs.existsSync(localVersionPath)) {
        // 버전 확인 가능 => 버전 리턴
        const localVersion = JSON.parse(fs.readFileSync(localVersionPath, 'utf-8'));
        return localVersion.version;
    } else {
        // 버전 확인 안됨 => 새로 다운로드 필요
        return null;
    }
}

module.exports = { checkInstalled, checkLatestVersion, generateVersionJson };