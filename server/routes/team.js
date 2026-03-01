const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

// 팀 정보 조회 (공개)
router.get('/', optionalAuth, (req, res) => {
  const team = db.prepare('SELECT * FROM team_info WHERE id = 1').get();

  // 회원 수
  const memberCount = db.prepare("SELECT COUNT(*) as count FROM members WHERE is_active = 1 AND role != 'pending'").get();
  team.member_count = memberCount.count;

  res.json(team);
});

// 팀 정보 수정 (관리자)
router.put('/', authenticate, requireAdmin, (req, res) => {
  const { team_name, team_name_en, president, description, practice_schedule, practice_location, founded_date, kakao_channel_url, logo_url } = req.body;

  db.prepare(
    `UPDATE team_info SET
     team_name = COALESCE(?, team_name),
     team_name_en = COALESCE(?, team_name_en),
     president = COALESCE(?, president),
     description = COALESCE(?, description),
     practice_schedule = COALESCE(?, practice_schedule),
     practice_location = COALESCE(?, practice_location),
     founded_date = COALESCE(?, founded_date),
     kakao_channel_url = COALESCE(?, kakao_channel_url),
     logo_url = COALESCE(?, logo_url),
     updated_at = datetime('now', 'localtime')
     WHERE id = 1`
  ).run(team_name, team_name_en, president, description, practice_schedule, practice_location, founded_date, kakao_channel_url, logo_url);

  const team = db.prepare('SELECT * FROM team_info WHERE id = 1').get();
  res.json(team);
});

module.exports = router;
