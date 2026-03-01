const { createClient } = require('@libsql/client');
const path = require('path');
const fs = require('fs');

// Vercel 환경에서는 TURSO_URL과 TURSO_AUTH_TOKEN이 필수
// 로컬 환경을 위해 file: 기반의 Fallback 마련 (필요시)
const dbUrl = process.env.TURSO_DATABASE_URL || 'file:' + path.join(__dirname, '..', 'data', 'jr-gators.db');
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

// 로컬 환경 시 data 폴더 생성
if (dbUrl.startsWith('file:')) {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

const db = createClient({
  url: dbUrl,
  authToken: authToken
});

// 스키마 초기화 (비동기)
async function initializeDatabase() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    // 여러 줄의 SQL은 executeMultiple로 실행
    await db.executeMultiple(schema);
    console.log('데이터베이스 초기화 완료 (@libsql/client)');
  } catch (err) {
    console.error('데이터베이스 초기화 에러:', err);
  }
}

initializeDatabase();

module.exports = db;
