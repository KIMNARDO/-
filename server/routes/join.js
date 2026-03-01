const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

// 가입 신청
router.post('/', async (req, res) => {
  try {
    const { kakao_id, name, phone, position, experience, message, profile_image } = req.body;

    if (!name) {
      return res.status(400).json({ error: '이름은 필수입니다' });
    }

    // 이미 회원인지 확인
    if (kakao_id) {
      const existingResult = await db.execute({
        sql: 'SELECT * FROM members WHERE kakao_id = ?',
        args: [kakao_id]
      });
      if (existingResult.rows[0]) {
        return res.status(400).json({ error: '이미 가입된 회원입니다' });
      }

      // 이미 신청했는지 확인
      const pendingRequestResult = await db.execute({
        sql: 'SELECT * FROM join_requests WHERE kakao_id = ? AND status = ?',
        args: [kakao_id, 'pending']
      });
      if (pendingRequestResult.rows[0]) {
        return res.status(400).json({ error: '이미 가입 신청이 접수되었습니다. 관리자 승인을 기다려 주세요.' });
      }
    }

    const insert = await db.execute({
      sql: `INSERT INTO join_requests (kakao_id, name, phone, position, experience, message, profile_image)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [kakao_id || null, name, phone || '', position || '', experience || '', message || '', profile_image || '']
    });

    res.status(201).json({
      id: insert.lastInsertRowid,
      message: '가입 신청이 완료되었습니다! 관리자 승인을 기다려 주세요.'
    });
  } catch (err) {
    res.status(500).json({ error: '가입 신청 에러' });
  }
});

// 가입 신청 목록 (관리자)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM join_requests';
    const args = [];

    if (status) {
      sql += ' WHERE status = ?';
      args.push(status);
    }

    sql += ' ORDER BY created_at DESC';
    const requestsResult = await db.execute({ sql, args });
    res.json(requestsResult.rows);
  } catch (err) {
    res.status(500).json({ error: '신청 목록 조회 에러' });
  }
});

// 가입 승인/거절 (관리자)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: '유효하지 않은 상태입니다' });
    }

    const requestResult = await db.execute({
      sql: 'SELECT * FROM join_requests WHERE id = ?',
      args: [req.params.id]
    });
    const request = requestResult.rows[0];

    if (!request) {
      return res.status(404).json({ error: '신청을 찾을 수 없습니다' });
    }

    await db.execute({
      sql: 'UPDATE join_requests SET status = ?, reviewed_by = ? WHERE id = ?',
      args: [status, req.user.id, req.params.id]
    });

    // 승인 시 회원으로 등록
    if (status === 'approved') {
      await db.execute({
        sql: `INSERT INTO members (kakao_id, name, phone, position, profile_image, role)
              VALUES (?, ?, ?, ?, ?, 'member')`,
        args: [request.kakao_id, request.name, request.phone, request.position || '', request.profile_image || '']
      });
    }

    res.json({ message: status === 'approved' ? '가입이 승인되었습니다' : '가입이 거절되었습니다' });
  } catch (err) {
    res.status(500).json({ error: '승인/거절 처리 에러' });
  }
});

module.exports = router;
