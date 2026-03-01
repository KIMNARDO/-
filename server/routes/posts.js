const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

// 피드/공지사항 목록
router.get('/', optionalAuth, (req, res) => {
  const { type, limit } = req.query;
  let query = `
    SELECT p.*, m.name as author_name, m.nickname as author_nickname, m.profile_image as author_image, m.role as author_role
    FROM posts p JOIN members m ON p.author_id = m.id
  `;
  const params = [];

  if (type) {
    query += ' WHERE p.type = ?';
    params.push(type);
  }

  query += ' ORDER BY p.is_pinned DESC, p.created_at DESC';

  if (limit) {
    query += ' LIMIT ?';
    params.push(parseInt(limit));
  }

  const posts = db.prepare(query).all(...params);
  res.json(posts);
});

// 게시글 작성 (관리자)
router.post('/', authenticate, requireAdmin, (req, res) => {
  const { title, content, type, is_pinned } = req.body;

  if (!content) {
    return res.status(400).json({ error: '내용은 필수입니다' });
  }

  const result = db.prepare(
    'INSERT INTO posts (author_id, title, content, type, is_pinned) VALUES (?, ?, ?, ?, ?)'
  ).run(req.user.id, title || '', content, type || 'general', is_pinned ? 1 : 0);

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(post);
});

// 게시글 삭제 (관리자)
router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
  res.json({ message: '게시글이 삭제되었습니다' });
});

module.exports = router;
