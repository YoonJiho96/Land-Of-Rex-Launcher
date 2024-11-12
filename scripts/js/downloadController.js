export function handleDownload(api) {
    const downloadButton = document.getElementById('download-button');
    const downloadModal = document.getElementById('download-modal');
    const downloadYesBtn = document.getElementById('download-yes');
    const downloadNoBtn = document.getElementById('download-no');
    const downloadCompleteModal = document.getElementById('download-complete-modal');
    const downloadCompleteOkBtn = document.getElementById('download-complete-ok');
    const downloadErrorModal = document.getElementById('download-error-modal');
    const downloadErrorOkBtn = document.getElementById('download-error-ok');
    const downloadErrorMessage = document.getElementById('download-error-message');
    const progressGameContainer = document.getElementById('progress-game-container');
    const progressGameBar = document.getElementById('progress-game-bar');
    const progressGamePercent = document.getElementById('progress-game-percent');

    // 업데이트 버튼
    const updateButton = document.getElementById('game-update-button');

    // 게임 업데이트 버튼 이벤트
    updateButton.addEventListener('click', () => {
        // 모달 텍스트 설정
        document.querySelector('#download-modal h2').innerText = '게임 업데이트';
        document.querySelector('#download-modal p').innerText = '게임을 업데이트하시겠습니까?';
        document.querySelector('#download-complete-modal h2').innerText = '업데이트 완료';
        document.querySelector('#download-complete-modal p').innerText = '게임 업데이트가 성공적으로 완료되었습니다!';

        // '예' 버튼 클릭 시 다운로드 시작
        downloadYesBtn.addEventListener('click', () => {
            downloadModal.style.display = 'none';
            api.updateGame();
            progressGameContainer.style.display = 'block';
        }, { once: true });

        // '아니오' 버튼 클릭 시 모달 닫기
        downloadNoBtn.addEventListener('click', () => {
            downloadModal.style.display = 'none';
        }, { once: true });

        // 다운로드 확인 모달 표시
        downloadModal.style.display = 'flex';
    })

    // 다운로드 확인 모달 표시 및 다운로드 시작
    downloadButton.addEventListener('click', () => {
        // 모달 텍스트 설정
        document.querySelector('#download-modal h2').innerText = '게임 다운로드';
        document.querySelector('#download-modal p').innerText = '게임을 다운로드하시겠습니까?';
        document.querySelector('#download-complete-modal h2').innerText = '다운로드 완료';
        document.querySelector('#download-complete-modal p').innerText = '게임 다운로드가 성공적으로 완료되었습니다!';

        // '예' 버튼 클릭 시 다운로드 시작
        downloadYesBtn.addEventListener('click', () => {
            downloadModal.style.display = 'none';
            api.downloadGame();
            progressGameContainer.style.display = 'block';
        }, { once: true });

        // '아니오' 버튼 클릭 시 모달 닫기
        downloadNoBtn.addEventListener('click', () => {
            downloadModal.style.display = 'none';
        }, { once: true });

        // 다운로드 확인 모달 표시
        downloadModal.style.display = 'flex';
    });

    // 게임 다운로드 진행 상황 업데이트
    api.onDownloadGameProgress((progress) => {
        progressGamePercent.innerText = `${progress.percent}%`;
        progressGameBar.value = progress.percent;
    });

    // 게임 다운로드 완료 시 처리
    api.onDownloadGameComplete(() => {
        // progressGameContainer.style.display = 'none';
        progressGameBar.value = 100;
        progressGamePercent.innerText = '100%';
        downloadCompleteModal.style.display = 'flex';
    });

    // 게임 다운로드 오류 발생 시 처리
    api.onDownloadError((error) => {
        // progressGameContainer.style.display = 'none';
        progressGameBar.value = 100;
        progressGamePercent.innerText = '100%';
        downloadErrorMessage.textContent = `다운로드 중 오류 발생: ${error}`;
        downloadErrorModal.style.display = 'flex';
    });

    // 다운로드 완료 모달의 "확인" 버튼 클릭 시 모달 닫기
    downloadCompleteOkBtn.addEventListener('click', () => {
        downloadCompleteModal.style.display = 'none';
    });

    // 다운로드 오류 모달의 "확인" 버튼 클릭 시 모달 닫기
    downloadErrorOkBtn.addEventListener('click', () => {
        downloadErrorModal.style.display = 'none';
    });
}
