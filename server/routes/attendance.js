const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

// 출석 세션 목록 조회
router.get('/sessions', authenticate, (req, res) => {
  const { status, limit } = req.query;
  let query = 'SELECT s.*, m.name as created_by_name FROM attendance_sessions s LEFT JOIN members m ON s.created_by = m.id';
  const params = [];

  if (status) {
    query += ' WHERE s.status = ?';
    params.push(status);
  }

  query += ' ORDER BY s.date DESC, s.created_at DESC';

  if (limit) {
    query += ' LIMIT ?';
    params.push(parseInt(limit));
  }

  const sessions = db.prepare(query).all(...params);

  // 각 세션의 출석 인원 수 추가
  const countStmt = db.prepare(
    `SELECT COUNT(*) as count FROM attendance_records WHERE session_id = ? AND status IN ('present', 'late')`
  );
  sessions.forEach(s => {
    s.attendee_count = countStmt.get(s.id).count;
  });

  res.json(sessions);
});

// 세션 상세 (출석 기록 포함)
router.get('/sessions/:id', authenticate, (req, res) => {
  const session = db.prepare(
    'SELECT s.*, m.name as created_by_name FROM attendance_sessions s LEFT JOIN members m ON s.created_by = m.id WHERE s.id = ?'
  ).get(req.params.id);

  if (!session) {
    return res.status(404).json({ error: '세션을 찾을 수 없습니다' });
  }

  const records = db.prepare(
    `SELECT ar.*, m.name, m.nickname, m.profile_image, m.position
     FROM attendance_records ar
     JOIN members m ON ar.member_id = m.id
     WHERE ar.session_id = ?
     ORDER BY ar.checked_at ASC`
  ).all(req.params.id);

  res.json({ ...session, records });
});

// 세션 생성 (관리자)
router.post('/sessions', authenticate, requireAdmin, (req, res) => {
  const { title, date, time_start, time_end, location, type } = req.body;

  if (!title || !date) {
    return res.status(400).json({ error: '제목과 날짜는 필수입니다' });
  }

  const result = db.prepare(
    `INSERT INTO attendance_sessions (title, date, time_start, time_end, location, type, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(title, date, time_start || '', time_end || '', location || '', type || 'practice', req.user.id);

  const session = db.prepare('SELECT * FROM attendance_sessions WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(session);
});

// 세션 수정/마감 (관리자)
router.put('/sessions/:id', authenticate, requireAdmin, (req, res) => {
  const { title, date, time_start, time_end, location, type, status } = req.body;

  db.prepare(
    `UPDATE attendance_sessions SET
     title = COALESCE(?, title), date = COALESCE(?, date),
     time_start = COALESCE(?, time_start), time_end = COALESCE(?, time_end),
     location = COALESCE(?, location), type = COALESCE(?, type), status = COALESCE(?, status)
     WHERE id = ?`
  ).run(title, date, time_start, time_end, location, type, status, req.params.id);

  const session = db.prepare('SELECT * FROM attendance_sessions WHERE id = ?').get(req.params.id);
  res.json(session);
});

// 셀프 출석 체크
router.post('/check', authenticate, (req, res) => {
  const { session_id } = req.body;

  const session = db.prepare('SELECT * FROM attendance_sessions WHERE id = ? AND status = ?').get(session_id, 'open');
  if (!session) {
    return res.status(400).json({ error: '열린 세션이 아니거나 존재하지 않습니다' });
  }

  // 이미 출석했는지 확인
  const existing = db.prepare('SELECT * FROM attendance_records WHERE session_id = ? AND member_id = ?').get(session_id, req.user.id);
  if (existing) {
    return res.status(400).json({ error: '이미 출석 체크했습니다' });
  }

  db.prepare(
    `INSERT INTO attendance_records (session_id, member_id, status, checked_by)
     VALUES (?, ?, 'present', 'self')`
  ).run(session_id, req.user.id);

  res.status(201).json({ message: '출석 체크 완료!' });
});

// 관리자 출석 처리 (단일/다수)
router.post('/admin-check', authenticate, requireAdmin, (req, res) => {
  const { session_id, member_id, member_ids, status } = req.body;
  const attendStatus = status || 'present';

  const upsert = db.prepare(
    `INSERT INTO attendance_records (session_id, member_id, status, checked_by, confirmed)
     VALUES (?, ?, ?, 'admin', 1)
     ON CONFLICT(session_id, member_id) DO UPDATE SET status = ?, checked_by = 'admin', confirmed = 1`
  );

  if (member_ids && Array.isArray(member_ids)) {
    const tx = db.transaction(() => {
      for (const mid of member_ids) {
        upsert.run(session_id, mid, attendStatus, attendStatus);
      }
    });
    tx();
    res.json({ message: `${member_ids.length}명 출석 처리 완료` });
  } else if (member_id) {
    upsert.run(session_id, member_id, attendStatus, attendStatus);
    res.json({ message: '출석 처리 완료' });
  } else {
    res.status(400).json({ error: 'member_id 또는 member_ids가 필요합니다' });
  }
});

// 출석 확인 (관리자가 셀프 체크를 확인)
router.put('/confirm/:id', authenticate, requireAdmin, (req, res) => {
  db.prepare('UPDATE attendance_records SET confirmed = 1 WHERE id = ?').run(req.params.id);
  res.json({ message: '출석 확인 완료' });
});

// 전체 출석 통계
router.get('/stats', authenticate, (req, res) => {
  const { month } = req.query;

  let query = `
    SELECT m.id, m.name, m.nickname, m.profile_image, m.position,
      COUNT(CASE WHEN ar.status = 'present' THEN 1 END) as present_count,
      COUNT(CASE WHEN ar.status = 'absent' THEN 1 END) as absent_count,
      COUNT(CASE WHEN ar.status = 'late' THEN 1 END) as late_count
    FROM members m
    LEFT JOIN attendance_records ar ON m.id = ar.member_id
  `;
  const params = [];

  if (month) {
    query += ' LEFT JOIN attendance_sessions s ON ar.session_id = s.id WHERE s.date LIKE ? AND m.is_active = 1 AND m.role != ?';
    params.push(`${month}%`, 'pending');
  } else {
    query += ' WHERE m.is_active = 1 AND m.role != ?';
    params.push('pending');
  }

  query += ' GROUP BY m.id ORDER BY present_count DESC';
  const stats = db.prepare(query).all(...params);
  res.json(stats);
});

// 내 출석 기록
router.get('/my', authenticate, (req, res) => {
  const records = db.prepare(
    `SELECT ar.*, s.title, s.date, s.type, s.location
     FROM attendance_records ar
     JOIN attendance_sessions s ON ar.session_id = s.id
     WHERE ar.member_id = ?
     ORDER BY s.date DESC`
  ).all(req.user.id);
  res.json(records);
});

module.exports = router;
