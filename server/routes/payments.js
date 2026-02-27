const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

// 회비 설정 조회
router.get('/settings', authenticate, (req, res) => {
  const settings = db.prepare('SELECT * FROM payment_settings WHERE id = 1').get();
  res.json(settings);
});

// 회비 설정 변경 (관리자)
router.put('/settings', authenticate, requireAdmin, (req, res) => {
  const { monthly_fee, bank_name, account_number, account_holder, due_day } = req.body;

  db.prepare(
    `UPDATE payment_settings SET
     monthly_fee = COALESCE(?, monthly_fee),
     bank_name = COALESCE(?, bank_name),
     account_number = COALESCE(?, account_number),
     account_holder = COALESCE(?, account_holder),
     due_day = COALESCE(?, due_day),
     updated_at = datetime('now', 'localtime')
     WHERE id = 1`
  ).run(monthly_fee, bank_name, account_number, account_holder, due_day);

  const settings = db.prepare('SELECT * FROM payment_settings WHERE id = 1').get();
  res.json(settings);
});

// 전체 납부 현황 (월별)
router.get('/', authenticate, (req, res) => {
  const { month } = req.query;
  const targetMonth = month || new Date().toISOString().slice(0, 7);

  // 모든 활동 회원 + 해당 월 납부 정보
  const members = db.prepare(
    `SELECT m.id, m.name, m.nickname, m.profile_image, m.position,
            p.id as payment_id, p.amount, p.status as payment_status, p.paid_date, p.note
     FROM members m
     LEFT JOIN payments p ON m.id = p.member_id AND p.month = ?
     WHERE m.is_active = 1 AND m.role != 'pending'
     ORDER BY m.name ASC`
  ).all(targetMonth);

  // 요약 통계
  const summary = {
    total: members.length,
    paid: members.filter(m => m.payment_status === 'paid').length,
    unpaid: members.filter(m => !m.payment_status || m.payment_status === 'unpaid').length,
    pending: members.filter(m => m.payment_status === 'pending').length
  };

  res.json({ month: targetMonth, members, summary });
});

// 개인 납부 내역
router.get('/member/:memberId', authenticate, (req, res) => {
  const memberId = parseInt(req.params.memberId);

  // 본인 또는 관리자만 조회 가능
  if (req.user.id !== memberId && req.user.role !== 'admin') {
    return res.status(403).json({ error: '권한이 없습니다' });
  }

  const payments = db.prepare(
    `SELECT p.*, c.name as confirmed_by_name
     FROM payments p
     LEFT JOIN members c ON p.confirmed_by = c.id
     WHERE p.member_id = ?
     ORDER BY p.month DESC`
  ).all(memberId);

  res.json(payments);
});

// 납부 등록/변경 (관리자)
router.post('/', authenticate, requireAdmin, (req, res) => {
  const { member_id, amount, month, status, note } = req.body;

  if (!member_id || !month) {
    return res.status(400).json({ error: '회원 ID와 월은 필수입니다' });
  }

  const settings = db.prepare('SELECT monthly_fee FROM payment_settings WHERE id = 1').get();
  const payAmount = amount || settings.monthly_fee;

  db.prepare(
    `INSERT INTO payments (member_id, amount, month, status, paid_date, confirmed_by, note)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(member_id, month) DO UPDATE SET
       status = ?, amount = ?, paid_date = ?,
       confirmed_by = ?, note = COALESCE(?, note)`
  ).run(
    member_id, payAmount, month,
    status || 'paid',
    status === 'paid' ? new Date().toISOString().slice(0, 10) : null,
    req.user.id, note || '',
    status || 'paid', payAmount,
    status === 'paid' ? new Date().toISOString().slice(0, 10) : null,
    req.user.id, note
  );

  res.json({ message: '납부 처리 완료' });
});

// 일괄 미납 생성 (해당 월 전체 회원에 대해 unpaid 레코드 생성)
router.post('/generate', authenticate, requireAdmin, (req, res) => {
  const { month } = req.body;
  if (!month) {
    return res.status(400).json({ error: '월 정보가 필요합니다' });
  }

  const settings = db.prepare('SELECT monthly_fee FROM payment_settings WHERE id = 1').get();
  const members = db.prepare("SELECT id FROM members WHERE is_active = 1 AND role != 'pending'").all();

  const insert = db.prepare(
    `INSERT OR IGNORE INTO payments (member_id, amount, month, status) VALUES (?, ?, ?, 'unpaid')`
  );

  const tx = db.transaction(() => {
    for (const m of members) {
      insert.run(m.id, settings.monthly_fee, month);
    }
  });
  tx();

  res.json({ message: `${members.length}명의 ${month} 회비 레코드 생성 완료` });
});

module.exports = router;
