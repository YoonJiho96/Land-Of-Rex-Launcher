export function handleNotice(noticeAPI) {
    const noticeListElement = document.querySelector('.notice-list');
    const paginationElement = document.querySelector('.notice-pagination');

    let currentPage = 1; // 사용자에게 보여지는 페이지는 1부터 시작
    const pageSize = 5;

    async function loadNotices(page) {
        noticeListElement.innerHTML = ''; // 기존 공지사항 초기화
        const loadingIndicator = document.createElement('li');
        loadingIndicator.classList.add('notice-item', 'loading');
        loadingIndicator.textContent = '로딩 중...';
        noticeListElement.appendChild(loadingIndicator);

        try {
            const data = await noticeAPI.getNotices(page, pageSize);
            if (data && data.notices) {
                renderNotices(data.notices);
                setupPagination(data.totalPages, page, data.hasNext);
            } else {
                throw new Error('공지사항을 불러올 수 없습니다.');
            }
        } catch (error) {
            noticeListElement.innerHTML = `
                <li class="notice-item">공지사항을 불러오는 중 오류가 발생했습니다.</li>
                <li class="notice-item">
                    <button id="retry-button" class="page-button">재시도</button>
                </li>
            `;
            document.getElementById('retry-button').addEventListener('click', () => {
                loadNotices(page);
            });
        }
    }

    function renderNotices(notices) {
        noticeListElement.innerHTML = '';
        const fragment = document.createDocumentFragment();

        notices.forEach(notice => {
            const li = document.createElement('li');
            li.classList.add('notice-item');
            li.setAttribute('data-id', notice.id);

            const category = document.createElement('span');
            category.classList.add('notice-category');
            category.textContent = mapImportanceToCategory(notice.importance);

            const content = document.createElement('div');
            content.classList.add('notice-content');
            content.textContent = notice.title;

            const date = document.createElement('span');
            date.classList.add('notice-date');
            date.textContent = formatDate(notice.createdAt);

            li.appendChild(category);
            li.appendChild(content);
            li.appendChild(date);

            // 링크 열기
            li.addEventListener('click', () => {
                const id = notice.id;
                const url = `https://k11e102.p.ssafy.io/notices/${id}`;
                window.api.openExternalURL(url);
            });

            fragment.appendChild(li);
        });

        noticeListElement.appendChild(fragment);
    }

    function setupPagination(totalPages, currentPage, hasNext) {
        paginationElement.innerHTML = '';

        // 이전 버튼
        const prevButton = document.createElement('button');
        prevButton.classList.add('page-button');
        prevButton.textContent = '<';
        prevButton.setAttribute('aria-label', '이전 페이지');
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadNotices(currentPage);
            }
        });
        paginationElement.appendChild(prevButton);

        // 페이지 번호 버튼
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.classList.add('page-button');
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.textContent = i;
            pageButton.setAttribute('aria-label', `페이지 ${i}`);
            pageButton.addEventListener('click', () => {
                currentPage = i;
                loadNotices(i);
            });
            paginationElement.appendChild(pageButton);
        }

        // 다음 버튼
        const nextButton = document.createElement('button');
        nextButton.classList.add('page-button');
        nextButton.textContent = '>';
        nextButton.setAttribute('aria-label', '다음 페이지');
        nextButton.disabled = currentPage === totalPages || !hasNext;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadNotices(currentPage);
            }
        });
        paginationElement.appendChild(nextButton);
    }

    // 날짜 포맷
    function formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (`0${date.getMonth() + 1}`).slice(-2);
        const day = (`0${date.getDate()}`).slice(-2);
        const hours = (`0${date.getHours()}`).slice(-2);
        const minutes = (`0${date.getMinutes()}`).slice(-2);
        const seconds = (`0${date.getSeconds()}`).slice(-2);
        return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
    }

    function mapImportanceToCategory(importance) {
        switch (importance) {
            case 'HIGH':
                return '중요';
            case 'NORMAL':
                return '공지';
            default:
                return '기타';
        }
    }

    // 초기 로드
    loadNotices(currentPage);
}