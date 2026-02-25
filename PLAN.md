# SubManager - 구독 관리 앱

## 문제
AI 서비스, API, SaaS 구독이 급증하면서 사용자는 자신이 무엇에 돈을 내고 있는지,
결제일이 언제인지, 구독이 아직 필요한지 파악하기 어렵다. 이로 인해 불필요한 비용이 발생한다.

## 솔루션
Gmail 기반 구독 감지 및 관리 시스템.
이메일에서 결제/구독 알림을 자동 스캔하여 청구 정보를 추출하고,
결제일 전에 사용자에게 알려준다.

## 아키텍처

### 기술 스택
- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Auth**: NextAuth.js + Google OAuth (gmail.readonly scope)
- **Database**: Supabase (PostgreSQL)
- **Email 분석**: Gmail API (읽기 전용)
- **알림**: 이메일 → 브라우저 푸시 → Slack/Discord (점진적 추가)
- **PWA**: Service Worker + Web App Manifest (앱 설치 지원)

### 핵심 기능 (MVP)
1. Google 로그인 + Gmail 읽기 접근
2. 이메일 자동 스캔으로 구독/결제 감지
3. 구독 대시보드 (서비스명, 금액, 결제주기, 다음결제일)
4. 결제일 사전 알림 (3일, 1일 전)
5. 구독 상태 관리: 유지 / 해지 / 홀딩
6. 온보딩 설정 마법사 (비기술 사용자 안내)
7. PWA 지원 (웹에서 앱 설치)

### 디자인 원칙
- Stripe/Linear/Vercel 수준의 프리미엄 UI
- 이모지 대신 Lucide 전문 아이콘
- 모든 기능에 컨텍스트 기반 툴팁 가이드
- 다크/라이트 모드 지원

### 데이터베이스 스키마
→ `supabase-schema.sql` 참고

## 구현 상태

### Phase 1: 프로젝트 설정 ✅
- Next.js 16 + TypeScript + Tailwind CSS v4
- Supabase 스키마 (supabase-schema.sql)
- PWA (manifest.json + service worker)

### Phase 2: Google OAuth + 온보딩 ✅
- NextAuth.js + Google Provider (gmail.readonly)
- 3단계 설정 마법사 (/setup) — 단계별 안내 포함
- 토큰 Supabase 저장

### Phase 3: 이메일 분석 엔진 ✅
- Gmail API 클라이언트 (lib/gmail.ts)
- 20+ 서비스 패턴 매칭 (lib/subscription-detector.ts)
- 금액/통화/결제주기 자동 추출
- API: POST /api/gmail/scan

### Phase 4: 대시보드 UI ✅
- 통계 카드 (월비용, 활성구독, 주간결제, 절약금액)
- 구독 목록 + 상태 관리 (활성/홀딩/해지)
- 카테고리별 비용 차트
- 다가오는 결제 위젯
- 필터링 (상태/카테고리)
- 구독 직접 추가 모달

### Phase 5: 알림 시스템 ✅
- 알림 내역 페이지 (/dashboard/notifications)
- 결제 긴급도 표시 (3일/7일 기준)
- 알림 설정 UI

### Phase 6: 설정 + PWA ✅
- 알림 시점 커스텀 (7/5/3/2/1일 전)
- 연결 상태 모니터링
- PWA 설치 안내
- 이메일/브라우저 푸시 토글

## 실행 방법
```bash
cd submanager
cp .env.local.example .env.local
# .env.local에 환경변수 입력 (앱 내 설정 마법사 참고)
npm install
npm run dev
```

## 프로젝트 구조
```
submanager/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # 랜딩 페이지
│   │   ├── setup/page.tsx              # 온보딩 설정 마법사
│   │   ├── dashboard/
│   │   │   ├── page.tsx                # 메인 대시보드
│   │   │   ├── subscriptions/page.tsx  # 구독 목록
│   │   │   ├── scan/page.tsx           # 이메일 스캔
│   │   │   ├── notifications/page.tsx  # 알림
│   │   │   └── settings/page.tsx       # 설정
│   │   └── api/
│   │       ├── auth/[...nextauth]/     # Google OAuth
│   │       ├── gmail/scan/             # 이메일 스캔 API
│   │       └── subscriptions/          # 구독 CRUD API
│   ├── components/
│   │   ├── layout/                     # Sidebar, Header, Tooltip
│   │   └── dashboard/                  # StatCard, SubscriptionRow, Chart
│   ├── lib/
│   │   ├── supabase.ts                # DB 클라이언트
│   │   ├── gmail.ts                   # Gmail API
│   │   └── subscription-detector.ts   # 구독 감지 엔진
│   └── types/index.ts                 # TypeScript 타입
├── public/
│   ├── manifest.json                  # PWA 매니페스트
│   └── sw.js                          # Service Worker
└── supabase-schema.sql                # DB 스키마
```
