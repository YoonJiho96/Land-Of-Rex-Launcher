async function GetNoticeList(page = 0, size = 5) {
    try {
        const fetch = (await import('node-fetch')).default;
        const apiUrl = `https://k11e102.p.ssafy.io/api/v1/notices?page=${page}&size=${size}`;
        const response = await fetch(apiUrl, { method: 'GET' });

        if (!response.ok) {
            throw new Error(`서버 응답 오류: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("공지 사항 불러오기 오류:", error);
        return null;
    }
}

module.exports = { GetNoticeList };