const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

// 출석 세션 목록 조회
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const { status, limit } = req.query;
    let sql = 'SELECT s.*, m.name as created_by_name FROM attendance_sessions s LEFT JOIN members m ON s.created_by = m.id';
    const args = [];

    if (status) {
      sql += ' WHERE s.status = ?';
      args.push(status);
    }

    sql += ' ORDER BY s.date DESC, s.created_at DESC';

    if (limit) {
      sql += ' LIMIT ?';
      args.push(parseInt(limit));
    }

    const result = await db.execute({ sql, args });
    const sessions = result.rows;

    // 각 세션의 출석 인원 수 추가
    for (let s of sessions) {
      const countResult = await db.execute({
        sql: `SELECT COUNT(*) as count FROM attendance_records WHERE session_id = ? AND status IN ('present', 'late')`,
        args: [s.id]
      });
      s.attendee_count = countResult.rows[0].count;
    }

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: '세션 목록 조회 에러' });
  }
});

// 세션 상세 (출석 기록 포함)
router.get('/sessions/:id', authenticate, async (req, res) => {
  try {
    const sessionResult = await db.execute({
      sql: 'SELECT s.*, m.name as created_by_name FROM attendance_sessions s LEFT JOIN members m ON s.created_by = m.id WHERE s.id = ?',
      args: [req.params.id]
    });
    const session = sessionResult.rows[0];

    if (!session) {
      return res.status(404).json({ error: '세션을 찾을 수 없습니다' });
    }

    const recordsResult = await db.execute({
      sql: `SELECT ar.*, m.name, m.nickname, m.profile_image, m.position
            FROM attendance_records ar
            JOIN members m ON ar.member_id = m.id
            WHERE ar.session_id = ?
            ORDER BY ar.checked_at ASC`,
      args: [req.params.id]
    });

    res.json({ ...session, records: recordsResult.rows });
  } catch (err) {
    res.status(500).json({ error: '조회 에러' });
  }
});

// 세션 생성 (관리자)
router.post('/sessions', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, date, time_start, time_end, location, type } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: '제목과 날짜는 필수입니다' });
    }

    const insert = await db.execute({
      sql: `INSERT INTO attendance_sessions (title, date, time_start, time_end, location, type, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [title, date, time_start || '', time_end || '', location || '', type || 'practice', req.user.id]
    });

    const sessionResult = await db.execute({
      sql: 'SELECT * FROM attendance_sessions WHERE id = ?',
      args: [Number(insert.lastInsertRowid)]
    });
    res.status(201).json(sessionResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: '생성 에러' });
  }
});

// 세션 수정/마감 (관리자)
router.put('/sessions/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, date, time_start, time_end, location, type, status } = req.body;

    await db.execute({
      sql: `UPDATE attendance_sessions SET
            title = COALESCE(?, title), date = COALESCE(?, date),
            time_start = COALESCE(?, time_start), time_end = COALESCE(?, time_end),
            location = COALESCE(?, location), type = COALESCE(?, type), status = COALESCE(?, status)
            WHERE id = ?`,
      args: [title, date, time_start, time_end, location, type, status, req.params.id]
    });

    const sessionResult = await db.execute({
      sql: 'SELECT * FROM attendance_sessions WHERE id = ?',
      args: [req.params.id]
    });
    res.json(sessionResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: '수정 에러' });
  }
});

// 셀프 출석 체크
router.post('/check', authenticate, async (req, res) => {
  try {
    const { session_id } = req.body;

    const sessionResult = await db.execute({
      sql: 'SELECT * FROM attendance_sessions WHERE id = ? AND status = ?',
      args: [session_id, 'open']
    });
    if (!sessionResult.rows[0]) {
      return res.status(400).json({ error: '열린 세션이 아니거나 존재하지 않습니다' });
    }

    const existingResult = await db.execute({
      sql: 'SELECT * FROM attendance_records WHERE session_id = ? AND member_id = ?',
      args: [session_id, req.user.id]
    });
    if (existingResult.rows[0]) {
      return res.status(400).json({ error: '이미 출석 체크했습니다' });
    }

    await db.execute({
      sql: `INSERT INTO attendance_records (session_id, member_id, status, checked_by)
            VALUES (?, ?, 'present', 'self')`,
      args: [session_id, req.user.id]
    });

    res.status(201).json({ message: '출석 체크 완료!' });
  } catch (err) {
    res.status(500).json({ error: '출석 에러' });
  }
});

// 관리자 출석 처리 (단일/다수)
router.post('/admin-check', authenticate, requireAdmin, async (req, res) => {
  try {
    const { session_id, member_id, member_ids, status } = req.body;
    const attendStatus = status || 'present';

    const upsertSql = `INSERT INTO attendance_records (session_id, member_id, status, checked_by, confirmed)
                       VALUES (?, ?, ?, 'admin', 1)
                       ON CONFLICT(session_id, member_id) DO UPDATE SET status = ?, checked_by = 'admin', confirmed = 1`;

    if (member_ids && Array.isArray(member_ids)) {
      const tx = await db.transaction();
      try {
        for (const mid of member_ids) {
          await tx.execute({
            sql: upsertSql,
            args: [session_id, mid, attendStatus, attendStatus]
          });
        }
        await tx.commit();
        res.json({ message: `${member_ids.length}명 출석 처리 완료` });
      } catch (e) {
        await tx.rollback();
        res.status(500).json({ error: 'TX 에러' });
      }
    } else if (member_id) {
      await db.execute({
        sql: upsertSql,
        args: [session_id, member_id, attendStatus, attendStatus]
      });
      res.json({ message: '출석 처리 완료' });
    } else {
      res.status(400).json({ error: 'member_id 또는 member_ids가 필요합니다' });
    }
  } catch (err) {
    res.status(500).json({ error: '관리자 체크 에러' });
  }
});

// 출석 확인 (관리자가 셀프 체크를 확인)
router.put('/confirm/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await db.execute({
      sql: 'UPDATE attendance_records SET confirmed = 1 WHERE id = ?',
      args: [req.params.id]
    });
    res.json({ message: '출석 확인 완료' });
  } catch (err) {
    res.status(500).json({ error: '확인 에러' });
  }
});

// 전체 출석 통계
router.get('/stats', authenticate, async (req, res) => {
  try {
    const { month } = req.query;

    let sql = `
      SELECT m.id, m.name, m.nickname, m.profile_image, m.position,
        COUNT(CASE WHEN ar.status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN ar.status = 'absent' THEN 1 END) as absent_count,
        COUNT(CASE WHEN ar.status = 'late' THEN 1 END) as late_count
      FROM members m
      LEFT JOIN attendance_records ar ON m.id = ar.member_id
    `;
    const args = [];

    if (month) {
      sql += ' LEFT JOIN attendance_sessions s ON ar.session_id = s.id WHERE s.date LIKE ? AND m.is_active = 1 AND m.role != ?';
      args.push(`${month}%`, 'pending');
    } else {
      sql += ' WHERE m.is_active = 1 AND m.role != ?';
      args.push('pending');
    }

    sql += ' GROUP BY m.id ORDER BY present_count DESC';
    const statsResult = await db.execute({ sql, args });
    res.json(statsResult.rows);
  } catch (err) {
    res.status(500).json({ error: '통계 에러' });
  }
});

// 내 출석 기록
router.get('/my', authenticate, async (req, res) => {
  try {
    const recordsResult = await db.execute({
      sql: `SELECT ar.*, s.title, s.date, s.type, s.location
            FROM attendance_records ar
            JOIN attendance_sessions s ON ar.session_id = s.id
            WHERE ar.member_id = ?
            ORDER BY s.date DESC`,
      args: [req.user.id]
    });
    res.json(recordsResult.rows);
  } catch (err) {
    res.status(500).json({ error: '기록 에러' });
  }
});

module.exports = router;
