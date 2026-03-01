const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

// 팀 정보 조회 (공개)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const teamResult = await db.execute('SELECT * FROM team_info WHERE id = 1');
    const team = teamResult.rows[0];

    // 회원 수
    const memberCountResult = await db.execute("SELECT COUNT(*) as count FROM members WHERE is_active = 1 AND role != 'pending'");
    team.member_count = memberCountResult.rows[0].count;

    res.json(team);
  } catch (err) {
    res.status(500).json({ error: '팀 정보 조회 실패' });
  }
});

// 팀 정보 수정 (관리자)
router.put('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { team_name, team_name_en, president, description, practice_schedule, practice_location, founded_date, kakao_channel_url, logo_url } = req.body;

    await db.execute({
      sql: `UPDATE team_info SET
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
            WHERE id = 1`,
      args: [team_name, team_name_en, president, description, practice_schedule, practice_location, founded_date, kakao_channel_url, logo_url]
    });

    const teamResult = await db.execute('SELECT * FROM team_info WHERE id = 1');
    res.json(teamResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: '팀 정보 변경 실패' });
  }
});

module.exports = router;
