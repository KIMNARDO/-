const jwt = require('jsonwebtoken');
const db = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'jr-gators-dev-secret-change-in-production';

// JWT 토큰 생성
function generateToken(member) {
  return jwt.sign(
    { id: member.id, kakao_id: member.kakao_id, role: member.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// 인증 미들웨어
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '로그인이 필요합니다' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const member = db.prepare('SELECT * FROM members WHERE id = ? AND is_active = 1').get(decoded.id);
    if (!member) {
      return res.status(401).json({ error: '유효하지 않은 사용자입니다' });
    }
    req.user = member;
    next();
  } catch (err) {
    return res.status(401).json({ error: '인증 토큰이 만료되었습니다' });
  }
}

// 관리자 권한 미들웨어
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '관리자 권한이 필요합니다' });
  }
  next();
}

// 선택적 인증 (로그인 안 해도 접근 가능하지만, 로그인 시 사용자 정보 제공)
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const member = db.prepare('SELECT * FROM members WHERE id = ? AND is_active = 1').get(decoded.id);
    req.user = member || null;
  } catch {
    req.user = null;
  }
  next();
}

module.exports = { generateToken, authenticate, requireAdmin, optionalAuth, JWT_SECRET };
