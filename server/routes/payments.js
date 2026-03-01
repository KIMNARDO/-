const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

// 회비 설정 조회
router.get('/settings', authenticate, async (req, res) => {
  try {
    const settingsResult = await db.execute('SELECT * FROM payment_settings WHERE id = 1');
    res.json(settingsResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: '설정 조회 실패' });
  }
});

// 회비 설정 변경 (관리자)
router.put('/settings', authenticate, requireAdmin, async (req, res) => {
  try {
    const { monthly_fee, bank_name, account_number, account_holder, due_day } = req.body;

    await db.execute({
      sql: `UPDATE payment_settings SET
            monthly_fee = COALESCE(?, monthly_fee),
            bank_name = COALESCE(?, bank_name),
            account_number = COALESCE(?, account_number),
            account_holder = COALESCE(?, account_holder),
            due_day = COALESCE(?, due_day),
            updated_at = datetime('now', 'localtime')
            WHERE id = 1`,
      args: [monthly_fee, bank_name, account_number, account_holder, due_day]
    });

    const settingsResult = await db.execute('SELECT * FROM payment_settings WHERE id = 1');
    res.json(settingsResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: '설정 수정 실패' });
  }
});

// 전체 납부 현황 (월별)
router.get('/', authenticate, async (req, res) => {
  try {
    const { month } = req.query;
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    // 모든 활동 회원 + 해당 월 납부 정보
    const membersResult = await db.execute({
      sql: `SELECT m.id, m.name, m.nickname, m.profile_image, m.position,
                   p.id as payment_id, p.amount, p.status as payment_status, p.paid_date, p.note
            FROM members m
            LEFT JOIN payments p ON m.id = p.member_id AND p.month = ?
            WHERE m.is_active = 1 AND m.role != 'pending'
            ORDER BY m.name ASC`,
      args: [targetMonth]
    });
    const members = membersResult.rows;

    // 요약 통계
    const summary = {
      total: members.length,
      paid: members.filter(m => m.payment_status === 'paid').length,
      unpaid: members.filter(m => !m.payment_status || m.payment_status === 'unpaid').length,
      pending: members.filter(m => m.payment_status === 'pending').length
    };

    res.json({ month: targetMonth, members, summary });
  } catch (err) {
    res.status(500).json({ error: '현황 조회 실패' });
  }
});

// 개인 납부 내역
router.get('/member/:memberId', authenticate, async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId);

    // 본인 또는 관리자만 조회 가능
    if (req.user.id !== memberId && req.user.role !== 'admin') {
      return res.status(403).json({ error: '권한이 없습니다' });
    }

    const paymentsResult = await db.execute({
      sql: `SELECT p.*, c.name as confirmed_by_name
            FROM payments p
            LEFT JOIN members c ON p.confirmed_by = c.id
            WHERE p.member_id = ?
            ORDER BY p.month DESC`,
      args: [memberId]
    });

    res.json(paymentsResult.rows);
  } catch (err) {
    res.status(500).json({ error: '조회 에러' });
  }
});

// 납부 등록/변경 (관리자)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { member_id, amount, month, status, note } = req.body;

    if (!member_id || !month) {
      return res.status(400).json({ error: '회원 ID와 월은 필수입니다' });
    }

    const settingsResult = await db.execute('SELECT monthly_fee FROM payment_settings WHERE id = 1');
    const payAmount = amount || settingsResult.rows[0].monthly_fee;

    await db.execute({
      sql: `INSERT INTO payments (member_id, amount, month, status, paid_date, confirmed_by, note)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(member_id, month) DO UPDATE SET
              status = ?, amount = ?, paid_date = ?,
              confirmed_by = ?, note = COALESCE(?, note)`,
      args: [
        member_id, payAmount, month,
        status || 'paid',
        status === 'paid' ? new Date().toISOString().slice(0, 10) : null,
        req.user.id, note || '',
        status || 'paid', payAmount,
        status === 'paid' ? new Date().toISOString().slice(0, 10) : null,
        req.user.id, note
      ]
    });

    res.json({ message: '납부 처리 완료' });
  } catch (err) {
    res.status(500).json({ error: '등록 에러' });
  }
});

// 일괄 미납 생성 (해당 월 전체 회원에 대해 unpaid 레코드 생성)
router.post('/generate', authenticate, requireAdmin, async (req, res) => {
  try {
    const { month } = req.body;
    if (!month) {
      return res.status(400).json({ error: '월 정보가 필요합니다' });
    }

    const [settingsResult, membersResult] = await Promise.all([
      db.execute('SELECT monthly_fee FROM payment_settings WHERE id = 1'),
      db.execute("SELECT id FROM members WHERE is_active = 1 AND role != 'pending'")
    ]);

    const settings = settingsResult.rows[0];
    const members = membersResult.rows;

    const tx = await db.transaction();
    try {
      for (const m of members) {
        await tx.execute({
          sql: `INSERT OR IGNORE INTO payments (member_id, amount, month, status) VALUES (?, ?, ?, 'unpaid')`,
          args: [m.id, settings.monthly_fee, month]
        });
      }
      await tx.commit();
      res.json({ message: `${members.length}명의 ${month} 회비 레코드 생성 완료` });
    } catch (e) {
      await tx.rollback();
      res.status(500).json({ error: 'DB 트랜잭션 실패' });
    }
  } catch (err) {
    res.status(500).json({ error: '생성 에러' });
  }
});

module.exports = router;
