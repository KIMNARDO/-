require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? false
    : true,
  credentials: true
}));
app.use(express.json());

// DB 초기화
require('./db/database');

// API 라우트
app.use('/api/auth', require('./routes/auth'));
app.use('/api/members', require('./routes/members'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/team', require('./routes/team'));
app.use('/api/join', require('./routes/join'));
app.use('/api/posts', require('./routes/posts'));

// 프로덕션: React 빌드 서빙
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏀 JR 게이토스 서버 실행 중: http://0.0.0.0:${PORT}`);
});
