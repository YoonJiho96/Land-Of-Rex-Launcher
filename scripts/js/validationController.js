export function handleValidationControls(validation) {
    // 유효성 검사 결과에 따른 업데이트 필요 여부 표시
    validation.onUpdateRequired((requireUpdate) => {
        const updateStatus = document.getElementById('latest-game-version');

        if (requireUpdate) {
            updateStatus.textContent = '업데이트가 필요합니다.';
            updateStatus.style.color = 'red';
            setActiveButton('game-update-button');
        } else {
            updateStatus.textContent = '게임이 최신 버전입니다.';
            updateStatus.style.color = '#4CAF50';
            setActiveButton('game-start-button');
        }
    });

    // 게임 설치 확인
    validation.onInstallRequired((requireInstall) => {
        const updateStatus = document.getElementById('latest-game-version');
        if (requireInstall) {
            updateStatus.textContent = '게임 설치가 필요합니다.';
            updateStatus.style.color = 'red';
            setActiveButton('download-button');
        }
    });

    // 게임 확인 메시지
    validation.onSetMessage((message, color) => {
        const updateStatus = document.getElementById('latest-game-version');
        updateStatus.textContent = message;
        updateStatus.style.color = color;
    })

    // 유효성 검사 버튼
    const gameValidateBtn = document.getElementById('game-validate');
    gameValidateBtn.addEventListener('click', () => {
        validation.onValidateGame();
    });

    // 버튼 활성화
    function setActiveButton(buttonId) {
        const buttons = [
            document.getElementById('game-start-button'),
            document.getElementById('game-update-button'),
            document.getElementById('download-button')
        ];

        buttons.forEach((button) => {
            if (button.id === buttonId) {
                button.disabled = false;
                button.style.display = 'block';
            } else {
                button.disabled = true;
                button.style.display = 'none';
            }
        });
    }

    // 버튼 임시 블락
    function setBlockButton(buttonId, isDisabled) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = isDisabled;
        }
    }

    // 버튼 상태 변경 수신
    validation.onSetButtonState((buttonId, isDisabled) => {
        setBlockButton(buttonId, isDisabled);
    });
}