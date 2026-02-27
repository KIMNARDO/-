const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'jr-gators.db');

// data 폴더 생성
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// WAL 모드 활성화 (성능 향상)
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 스키마 초기화
function initializeDatabase() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schema);
  console.log('데이터베이스 초기화 완료');
}

initializeDatabase();

module.exports = db;
