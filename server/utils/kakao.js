const axios = require('axios');

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;
const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET;

// 카카오 인가 코드로 액세스 토큰 요청
async function getKakaoToken(code) {
    const params = {
          grant_type: 'authorization_code',
          client_id: KAKAO_REST_API_KEY,
          redirect_uri: KAKAO_REDIRECT_URI,
          code
    };

  // 클라이언트 시크릿이 설정된 경우 포함
  if (KAKAO_CLIENT_SECRET) {
        params.client_secret = KAKAO_CLIENT_SECRET;
  }

  const response = await axios.post('https://kauth.kakao.com/oauth/token', null, {
        params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
    return response.data;
}

// 카카오 사용자 정보 조회
async function getKakaoUserInfo(accessToken) {
    const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
          headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
}

// 카카오 로그아웃 (토큰 만료)
async function kakaoLogout(accessToken) {
    try {
          await axios.post('https://kapi.kakao.com/v1/user/logout', null, {
                  headers: { Authorization: `Bearer ${accessToken}` }
          });
    } catch (err) {
          // 로그아웃 실패해도 로컬 토큰 삭제로 처리
    }
}

// 카카오 로그인 URL 생성
function getKakaoLoginUrl() {
    return `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}&response_type=code`;
}

module.exports = { getKakaoToken, getKakaoUserInfo, kakaoLogout, getKakaoLoginUrl };
