const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

// 피드/공지사항 목록
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { type, limit } = req.query;
    let sql = `
      SELECT p.*, m.name as author_name, m.nickname as author_nickname, m.profile_image as author_image, m.role as author_role
      FROM posts p JOIN members m ON p.author_id = m.id
    `;
    const args = [];

    if (type) {
      sql += ' WHERE p.type = ?';
      args.push(type);
    }

    sql += ' ORDER BY p.is_pinned DESC, p.created_at DESC';

    if (limit) {
      sql += ' LIMIT ?';
      args.push(parseInt(limit));
    }

    const result = await db.execute({ sql, args });
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: '목록 조회 실패' });
  }
});

// 게시글 작성 (관리자)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, content, type, is_pinned } = req.body;

    if (!content) {
      return res.status(400).json({ error: '내용은 필수입니다' });
    }

    const insert = await db.execute({
      sql: 'INSERT INTO posts (author_id, title, content, type, is_pinned) VALUES (?, ?, ?, ?, ?)',
      args: [req.user.id, title || '', content, type || 'general', is_pinned ? 1 : 0]
    });

    const result = await db.execute({
      sql: 'SELECT * FROM posts WHERE id = ?',
      args: [Number(insert.lastInsertRowid)]
    });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: '작성 실패' });
  }
});

// 게시글 삭제 (관리자)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await db.execute({
      sql: 'DELETE FROM posts WHERE id = ?',
      args: [req.params.id]
    });
    res.json({ message: '게시글이 삭제되었습니다' });
  } catch (err) {
    res.status(500).json({ error: '삭제 실패' });
  }
});

module.exports = router;
