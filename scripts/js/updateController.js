export function handleUpdate(updater) {
    const updateModal = document.getElementById('update-modal');
    const latestVersionP = document.getElementById('latest-version');
    const updateYesBtn = document.getElementById('update-yes');
    const updateNoBtn = document.getElementById('update-no');
    const progressModal = document.getElementById('progress-modal');
    const progressBar = document.getElementById('progress-bar');
    const progressPercent = document.getElementById('progress-percent');
    const downloadedModal = document.getElementById('downloaded-modal');
    const installYesBtn = document.getElementById('install-yes');
    const installNoBtn = document.getElementById('install-no');

    // 업데이트 이벤트 핸들러
    updater.onUpdateAvailable((version) => {
        // latestVersionP.textContent = `새로운 버전: ${version}`;
        updateModal.style.display = 'flex';
    });

    updater.onDownloadProgress((progress) => {
        const percent = Math.round(progress.percent);
        progressBar.style.width = `${percent}%`;
        progressPercent.textContent = `${percent}%`;
        if (progressModal.style.display !== 'flex') {
            progressModal.style.display = 'flex';
        }
    });

    updater.onUpdateDownloaded(() => {
        progressModal.style.display = 'none';
        downloadedModal.style.display = 'flex';
    });

    updater.onUpdateError((error) => {
        alert(`업데이트 중 오류가 발생했습니다: ${error}`);
    });

    // "예" 버튼 클릭 시 업데이트 다운로드 시작
    updateYesBtn.addEventListener('click', () => {
        updater.downloadUpdate();
        updateModal.style.display = 'none';
    });

    // "아니오" 버튼 클릭 시 모달 닫기
    updateNoBtn.addEventListener('click', () => {
        updateModal.style.display = 'none';
    });

    // "예" 버튼 클릭 시 업데이트 설치
    installYesBtn.addEventListener('click', () => {
        updater.installUpdate();
    });

    // "아니오" 버튼 클릭 시 모달 닫기
    installNoBtn.addEventListener('click', () => {
        downloadedModal.style.display = 'none';
    });

    // 현재 버전 설정
    const currentVersionSpan = document.getElementById('current-version');
    updater.onCurrentVersion((version) => {
        currentVersionSpan.textContent = version;
    });
}