import { handleUpdate } from './updateController.js';
import { handleDownload } from './downloadController.js';
import { handleGameStart } from './gameController.js';
import { handleWindowControls } from './ui/windowControls.js';
import { handleValidationControls } from './validationController.js';
import { handleNotice } from './noticeController.js';

document.addEventListener('DOMContentLoaded', () => {
    // 업데이트 관련 초기화
    handleUpdate(window.updater);

    // 다운로드 관련 초기화
    handleDownload(window.api);

    // 게임 시작 관련 초기화
    handleGameStart(window.game);

    // 창 제어 초기화
    handleWindowControls(window.electron);

    // 게임 유효성 검사 초기화
    handleValidationControls(window.validation);

    // 공지사항 초기화
    handleNotice(window.noticeAPI);
});