const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

// 회원 목록 조회
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT id, name, nickname, profile_image, role, position, jersey_number, bio, is_active, joined_date
      FROM members WHERE role != 'pending' ORDER BY role DESC, name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: '회원 목록 조회 실패' });
  }
});

// 회원 상세 조회
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await db.execute({
      sql: `SELECT id, name, nickname, phone, profile_image, role, position, jersey_number, bio, is_active, joined_date
            FROM members WHERE id = ?`,
      args: [req.params.id]
    });
    const member = result.rows[0];

    if (!member) {
      return res.status(404).json({ error: '회원을 찾을 수 없습니다' });
    }

    // 출석 통계
    const statsResult = await db.execute({
      sql: `SELECT
              COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
              COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_count,
              COUNT(CASE WHEN status = 'late' THEN 1 END) as late_count,
              COUNT(*) as total
            FROM attendance_records WHERE member_id = ?`,
      args: [req.params.id]
    });

    res.json({ ...member, attendance_stats: statsResult.rows[0] });
  } catch (err) {
    res.status(500).json({ error: '회원 상세 조회 실패' });
  }
});

// 회원 정보 수정 (본인 또는 관리자)
router.put('/:id', authenticate, async (req, res) => {
  const targetId = parseInt(req.params.id);

  if (req.user.id !== targetId && req.user.role !== 'admin') {
    return res.status(403).json({ error: '권한이 없습니다' });
  }

  try {
    const { name, nickname, phone, position, jersey_number, bio } = req.body;
    await db.execute({
      sql: `UPDATE members SET name = COALESCE(?, name), nickname = COALESCE(?, nickname),
            phone = COALESCE(?, phone), position = COALESCE(?, position),
            jersey_number = COALESCE(?, jersey_number), bio = COALESCE(?, bio)
            WHERE id = ?`,
      args: [name, nickname, phone, position, jersey_number, bio, targetId]
    });

    const updatedResult = await db.execute({
      sql: 'SELECT id, name, nickname, phone, profile_image, role, position, jersey_number, bio FROM members WHERE id = ?',
      args: [targetId]
    });
    res.json(updatedResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: '회원 정보 수정 실패' });
  }
});

// 역할 변경 (관리자 전용)
router.put('/:id/role', authenticate, requireAdmin, async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'member'].includes(role)) {
    return res.status(400).json({ error: '유효하지 않은 역할입니다' });
  }

  try {
    await db.execute({
      sql: 'UPDATE members SET role = ? WHERE id = ?',
      args: [role, req.params.id]
    });
    res.json({ message: '역할이 변경되었습니다' });
  } catch (err) {
    res.status(500).json({ error: '역할 변경 실패' });
  }
});

// 회원 비활성화 (관리자 전용)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await db.execute({
      sql: 'UPDATE members SET is_active = 0 WHERE id = ?',
      args: [req.params.id]
    });
    res.json({ message: '회원이 비활성화되었습니다' });
  } catch (err) {
    res.status(500).json({ error: '회원 비활성화 실패' });
  }
});

module.exports = router;
