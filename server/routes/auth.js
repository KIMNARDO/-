const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { generateToken, authenticate } = require('../middleware/auth');
const { getKakaoToken, getKakaoUserInfo, getKakaoLoginUrl } = require('../utils/kakao');

// 카카오 로그인 URL
router.get('/kakao', (req, res) => {
  res.json({ url: getKakaoLoginUrl() });
});

// 카카오 콜백 처리
router.post('/kakao/callback', async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: '인가 코드가 필요합니다' });
  }

  try {
    // 카카오 토큰 획득
    const tokenData = await getKakaoToken(code);
    const userInfo = await getKakaoUserInfo(tokenData.access_token);

    const kakaoId = String(userInfo.id);
    const nickname = userInfo.kakao_account?.profile?.nickname || '';
    const profileImage = userInfo.kakao_account?.profile?.profile_image_url || '';

    // 기존 회원 확인
    let member = db.prepare('SELECT * FROM members WHERE kakao_id = ?').get(kakaoId);

    if (member) {
      // 프로필 이미지 업데이트
      db.prepare('UPDATE members SET profile_image = ?, nickname = ? WHERE id = ?')
        .run(profileImage, nickname || member.nickname, member.id);
      member = db.prepare('SELECT * FROM members WHERE id = ?').get(member.id);
    }

    // 회원이 아닌 경우 - 가입 신청 여부 확인
    if (!member) {
      const existingRequest = db.prepare('SELECT * FROM join_requests WHERE kakao_id = ? AND status = ?').get(kakaoId, 'pending');
      return res.json({
        isNewUser: true,
        hasPendingRequest: !!existingRequest,
        kakaoId,
        nickname,
        profileImage
      });
    }

    // pending 상태 (승인 대기) 회원
    if (member.role === 'pending') {
      return res.json({
        isNewUser: false,
        isPending: true,
        message: '가입 승인 대기 중입니다'
      });
    }

    const token = generateToken(member);
    res.json({
      isNewUser: false,
      token,
      member: {
        id: member.id,
        name: member.name,
        nickname: member.nickname,
        role: member.role,
        profile_image: member.profile_image,
        position: member.position,
        jersey_number: member.jersey_number
      }
    });
  } catch (err) {
    console.error('카카오 로그인 에러:', err.message);
    res.status(500).json({ error: '카카오 로그인에 실패했습니다' });
  }
});

// 개발용 로그인 (카카오 API 키 없을 때)
router.post('/dev-login', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  const { name, role } = req.body;
  const devKakaoId = `dev_${Date.now()}`;

  // 기존 개발용 계정 확인
  let member = db.prepare('SELECT * FROM members WHERE name = ? AND kakao_id LIKE ?').get(name, 'dev_%');

  if (!member) {
    const stmt = db.prepare(
      'INSERT INTO members (kakao_id, name, nickname, role) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(devKakaoId, name || '테스트 사용자', name || '테스트', role || 'admin');
    member = db.prepare('SELECT * FROM members WHERE id = ?').get(result.lastInsertRowid);
  }

  const token = generateToken(member);
  res.json({
    token,
    member: {
      id: member.id,
      name: member.name,
      nickname: member.nickname,
      role: member.role,
      profile_image: member.profile_image,
      position: member.position,
      jersey_number: member.jersey_number
    }
  });
});

// 현재 사용자 정보
router.get('/me', authenticate, (req, res) => {
  const { id, name, nickname, role, profile_image, position, jersey_number, phone } = req.user;
  res.json({ id, name, nickname, role, profile_image, position, jersey_number, phone });
});

module.exports = router;
