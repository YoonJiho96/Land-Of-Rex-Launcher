// 업데이트 모달 요소
const updateModal = document.getElementById('update-modal');
const downloadedModal = document.getElementById('downloaded-modal');
const progressModal = document.getElementById('progress-modal');
const currentVersionSpan = document.getElementById('current-version');
const latestVersionP = document.getElementById('latest-version');
const progressBar = document.getElementById('progress-bar');
const progressPercent = document.getElementById('progress-percent');

// 버튼 요소
const updateYesBtn = document.getElementById('update-yes');
const updateNoBtn = document.getElementById('update-no');
const installYesBtn = document.getElementById('install-yes');
const installNoBtn = document.getElementById('install-no');

// 현재 버전 설정 (메인 프로세스로부터 수신)
window.updater.onCurrentVersion((version) => {
    document.getElementById('current-version').textContent = version;
});

// 업데이트가 있을 때
window.updater.onUpdateAvailable((version) => {
    latestVersionP.textContent = `새로운 버전: ${version}`;
    updateModal.style.display = 'flex';
});

// 업데이트 다운로드 진행 시
window.updater.onDownloadProgress((progress) => {
    const percent = Math.round(progress.percent);
    progressBar.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;
    if (progressModal.style.display !== 'flex') {
        progressModal.style.display = 'flex';
    }
});

// 업데이트 다운로드 완료 시
window.updater.onUpdateDownloaded(() => {
    progressModal.style.display = 'none';
    downloadedModal.style.display = 'flex';
});

// 업데이트 오류 발생 시
window.updater.onUpdateError((error) => {
    alert(`업데이트 중 오류가 발생했습니다: ${error}`);
});

// "예" 버튼 클릭 시 업데이트 다운로드 시작
updateYesBtn.addEventListener('click', () => {
    window.updater.downloadUpdate();
    updateModal.style.display = 'none';
});

// "아니오" 버튼 클릭 시 모달 닫기
updateNoBtn.addEventListener('click', () => {
    updateModal.style.display = 'none';
});

// "예" 버튼 클릭 시 업데이트 설치
installYesBtn.addEventListener('click', () => {
    window.updater.installUpdate();
});

// "아니오" 버튼 클릭 시 모달 닫기
installNoBtn.addEventListener('click', () => {
    downloadedModal.style.display = 'none';
});

// 버튼 동작
document.getElementById('minimize-btn').addEventListener('click', () => {
    window.electron.minimizeWindow();
});

document.getElementById('close-btn').addEventListener('click', () => {
    window.electron.closeWindow();
});