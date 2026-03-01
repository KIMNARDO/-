-- JR 게이토스 농구팀 관리 앱 데이터베이스 스키마

-- 팀 정보
CREATE TABLE IF NOT EXISTS team_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_name TEXT NOT NULL DEFAULT '제이알 게이토스',
    team_name_en TEXT DEFAULT 'JR Gators',
    president TEXT DEFAULT '김현석',
    description TEXT DEFAULT '즐겁게 농구하는 JR 게이토스입니다!',
    practice_schedule TEXT DEFAULT '매주 화/목 20:00-22:00',
    practice_location TEXT DEFAULT '',
    founded_date TEXT DEFAULT '',
    kakao_channel_url TEXT DEFAULT '',
    logo_url TEXT DEFAULT '',
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 회원
CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kakao_id TEXT UNIQUE,
    name TEXT NOT NULL,
    nickname TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    profile_image TEXT DEFAULT '',
    role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('admin', 'member', 'pending')),
    position TEXT DEFAULT '' CHECK(position IN ('', 'PG', 'SG', 'SF', 'PF', 'C')),
    jersey_number INTEGER,
    bio TEXT DEFAULT '',
    is_active INTEGER NOT NULL DEFAULT 1,
    joined_date TEXT DEFAULT (date('now', 'localtime')),
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 출석 세션
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time_start TEXT DEFAULT '',
    time_end TEXT DEFAULT '',
    location TEXT DEFAULT '',
    type TEXT NOT NULL DEFAULT 'practice' CHECK(type IN ('practice', 'game', 'event')),
    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'closed')),
    created_by INTEGER REFERENCES members(id),
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 출석 기록
CREATE TABLE IF NOT EXISTS attendance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'present' CHECK(status IN ('present', 'absent', 'late')),
    checked_by TEXT NOT NULL DEFAULT 'self' CHECK(checked_by IN ('self', 'admin')),
    confirmed INTEGER NOT NULL DEFAULT 0,
    checked_at TEXT DEFAULT (datetime('now', 'localtime')),
    UNIQUE(session_id, member_id)
);

-- 회비 설정
CREATE TABLE IF NOT EXISTS payment_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    monthly_fee INTEGER NOT NULL DEFAULT 50000,
    bank_name TEXT DEFAULT '국민은행',
    account_number TEXT DEFAULT '',
    account_holder TEXT DEFAULT '김현석',
    due_day INTEGER DEFAULT 10,
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 회비 납부 기록
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    month TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unpaid' CHECK(status IN ('paid', 'unpaid', 'pending')),
    paid_date TEXT,
    confirmed_by INTEGER REFERENCES members(id),
    note TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    UNIQUE(member_id, month)
);

-- 가입 신청
CREATE TABLE IF NOT EXISTS join_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kakao_id TEXT,
    name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    position TEXT DEFAULT '',
    experience TEXT DEFAULT '',
    message TEXT DEFAULT '',
    profile_image TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    reviewed_by INTEGER REFERENCES members(id),
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 공지사항/피드
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL REFERENCES members(id),
    title TEXT DEFAULT '',
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'general' CHECK(type IN ('general', 'announcement', 'game_result', 'highlight')),
    is_pinned INTEGER NOT NULL DEFAULT 0,
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 초기 데이터 삽입
INSERT OR IGNORE INTO team_info (id, team_name, president) VALUES (1, '제이알 게이토스', '김현석');
INSERT OR IGNORE INTO payment_settings (id, monthly_fee, account_holder) VALUES (1, 50000, '김현석');
