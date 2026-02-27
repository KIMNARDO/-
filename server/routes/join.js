const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

// 가입 신청
router.post('/', (req, res) => {
  const { kakao_id, name, phone, position, experience, message, profile_image } = req.body;

  if (!name) {
    return res.status(400).json({ error: '이름은 필수입니다' });
  }

  // 이미 회원인지 확인
  if (kakao_id) {
    const existing = db.prepare('SELECT * FROM members WHERE kakao_id = ?').get(kakao_id);
    if (existing) {
      return res.status(400).json({ error: '이미 가입된 회원입니다' });
    }

    // 이미 신청했는지 확인
    const pendingRequest = db.prepare('SELECT * FROM join_requests WHERE kakao_id = ? AND status = ?').get(kakao_id, 'pending');
    if (pendingRequest) {
      return res.status(400).json({ error: '이미 가입 신청이 접수되었습니다. 관리자 승인을 기다려 주세요.' });
    }
  }

  const result = db.prepare(
    `INSERT INTO join_requests (kakao_id, name, phone, position, experience, message, profile_image)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(kakao_id || null, name, phone || '', position || '', experience || '', message || '', profile_image || '');

  res.status(201).json({
    id: result.lastInsertRowid,
    message: '가입 신청이 완료되었습니다! 관리자 승인을 기다려 주세요.'
  });
});

// 가입 신청 목록 (관리자)
router.get('/', authenticate, requireAdmin, (req, res) => {
  const { status } = req.query;
  let query = 'SELECT * FROM join_requests';
  const params = [];

  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC';
  const requests = db.prepare(query).all(...params);
  res.json(requests);
});

// 가입 승인/거절 (관리자)
router.put('/:id', authenticate, requireAdmin, (req, res) => {
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: '유효하지 않은 상태입니다' });
  }

  const request = db.prepare('SELECT * FROM join_requests WHERE id = ?').get(req.params.id);
  if (!request) {
    return res.status(404).json({ error: '신청을 찾을 수 없습니다' });
  }

  db.prepare('UPDATE join_requests SET status = ?, reviewed_by = ? WHERE id = ?')
    .run(status, req.user.id, req.params.id);

  // 승인 시 회원으로 등록
  if (status === 'approved') {
    db.prepare(
      `INSERT INTO members (kakao_id, name, phone, position, profile_image, role)
       VALUES (?, ?, ?, ?, ?, 'member')`
    ).run(request.kakao_id, request.name, request.phone, request.position || '', request.profile_image || '');
  }

  res.json({ message: status === 'approved' ? '가입이 승인되었습니다' : '가입이 거절되었습니다' });
});

module.exports = router;
