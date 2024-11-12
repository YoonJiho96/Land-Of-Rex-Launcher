export function handleGameStart(game) {
    const gameStartBtn = document.getElementById('game-start-button');
    const gameStartErrorModal = document.getElementById('game-start-error-modal');
    const gameStartErrorOkBtn = document.getElementById('game-start-error-ok');
    const gameStartErrorMessage = document.getElementById('game-start-error-message');

    // 게임 시작
    gameStartBtn.addEventListener('click', () => {
        game.gameStart();
    });

    // 게임 시작 오류 이벤트 수신 시
    game.onGameStartError((errorMessage) => {
        console.error("게임 실행 오류 발생:", errorMessage);
        gameStartErrorMessage.textContent = `게임 시작 중 오류 발생: ${errorMessage}`;
        gameStartErrorModal.style.display = 'flex';
    });

    // 게임 시작 오류 모달의 "확인" 버튼 클릭 시 모달 닫기
    gameStartErrorOkBtn.addEventListener('click', () => {
        gameStartErrorModal.style.display = 'none';
    });
}
